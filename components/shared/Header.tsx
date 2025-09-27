import React, { useState, useEffect, useRef } from 'react';
import { User, AppNotification, Role, Announcement, Event } from '../../types';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  toggleSidebar: () => void;
  data: {
    users: User[];
    announcements: Announcement[];
    events: Event[];
    appNotifications: AppNotification[];
  };
  markNotificationsAsRead: () => void;
  setActiveView: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, toggleSidebar, data, markNotificationsAsRead, setActiveView }) => {
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ employees: User[], announcements: Announcement[], events: Event[] }>({ employees: [], announcements: [], events: [] });
  const [isResultsOpen, setResultsOpen] = useState(false);

  const notifications = data.appNotifications.filter(n => n.userId === user.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close notification panel on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setResultsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTogglePanel = () => {
    setPanelOpen(prev => !prev);
    if (!isPanelOpen && unreadCount > 0) {
      setTimeout(() => markNotificationsAsRead(), 1000); 
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) {
        setResultsOpen(false);
    }
  };

  useEffect(() => {
    if (searchQuery.length < 2) {
        setSearchResults({ employees: [], announcements: [], events: [] });
        setResultsOpen(false);
        return;
    }

    const handler = setTimeout(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        
        const employees = user.role === Role.RH ? data.users.filter(u =>
            u.role === Role.FUNCIONARIO &&
            (u.name.toLowerCase().includes(lowerCaseQuery) || u.email.toLowerCase().includes(lowerCaseQuery))
        ) : [];

        const announcements = data.announcements.filter(a =>
            a.title.toLowerCase().includes(lowerCaseQuery) ||
            a.content?.toLowerCase().includes(lowerCaseQuery)
        );

        const events = data.events.filter(e => {
            const isParticipant = user.role === Role.FUNCIONARIO ? e.participantIds.includes(user.id) : true;
            const matchesQuery = e.title.toLowerCase().includes(lowerCaseQuery) ||
                                 e.description.toLowerCase().includes(lowerCaseQuery);
            return isParticipant && matchesQuery;
        });

        const hasResults = employees.length > 0 || announcements.length > 0 || events.length > 0;
        setSearchResults({ employees, announcements, events });
        setResultsOpen(hasResults);

    }, 300);

    return () => {
        clearTimeout(handler);
    };
  }, [searchQuery, data, user.id, user.role]);

  const handleResultClick = (view: string) => {
    setActiveView(view);
    setSearchQuery('');
    setResultsOpen(false);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md z-10">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-slate-500 focus:outline-none lg:hidden mr-4">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">InFort RH</h1>
      </div>
      
      <div className="flex-1 flex justify-center px-2 sm:px-4 lg:px-8">
        <div className="relative w-full max-w-lg" ref={searchRef}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => { if (searchQuery) setResultsOpen(true); }}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
          />
          {isResultsOpen && (
            <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-20 max-h-96 overflow-y-auto border border-slate-200">
                <ul className="divide-y divide-slate-100">
                    {searchResults.employees.length > 0 && (
                        <>
                            <li className="px-4 py-2 bg-slate-50 text-sm font-semibold text-slate-600 sticky top-0">Funcionários</li>
                            {searchResults.employees.slice(0, 5).map(employee => (
                                <li key={`emp-${employee.id}`}>
                                    <button onClick={() => handleResultClick('manage-employees')} className="w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors">
                                        <p className="text-sm font-medium text-slate-800">{employee.name}</p>
                                        <p className="text-xs text-slate-500">{employee.email}</p>
                                    </button>
                                </li>
                            ))}
                        </>
                    )}
                    {searchResults.announcements.length > 0 && (
                        <>
                            <li className="px-4 py-2 bg-slate-50 text-sm font-semibold text-slate-600 sticky top-0">Informativos</li>
                            {searchResults.announcements.slice(0, 5).map(announcement => (
                                <li key={`ann-${announcement.id}`}>
                                    <button onClick={() => handleResultClick('announcements')} className="w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors">
                                        <p className="text-sm font-medium text-slate-800">{announcement.title}</p>
                                        {announcement.content && <p className="text-xs text-slate-500 truncate">{announcement.content}</p>}
                                    </button>
                                </li>
                            ))}
                        </>
                    )}
                    {searchResults.events.length > 0 && (
                        <>
                            <li className="px-4 py-2 bg-slate-50 text-sm font-semibold text-slate-600 sticky top-0">Eventos</li>
                            {searchResults.events.slice(0, 5).map(event => (
                                <li key={`evt-${event.id}`}>
                                    <button onClick={() => handleResultClick(user.role === Role.RH ? 'manage-events' : 'my-events')} className="w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors">
                                        <p className="text-sm font-medium text-slate-800">{event.title}</p>
                                        <p className="text-xs text-slate-500">{new Date(event.dateTime).toLocaleDateString('pt-BR')}</p>
                                    </button>
                                </li>
                            ))}
                        </>
                    )}
                </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="relative" ref={panelRef}>
          <button
            onClick={handleTogglePanel}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            title="Notificações"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>
          {isPanelOpen && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setPanelOpen(false)}
              setActiveView={setActiveView}
            />
          )}
        </div>
        <div className="text-right hidden md:block">
            <div className="font-medium text-slate-900">{user.name}</div>
            <div className="text-sm text-slate-500">{user.role}</div>
        </div>
        <button
          onClick={onLogout}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          title="Sair"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;