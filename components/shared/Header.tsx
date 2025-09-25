import React, { useState, useEffect, useRef } from 'react';
import { User, AppNotification } from '../../types';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  toggleSidebar: () => void;
  notifications: AppNotification[];
  markNotificationsAsRead: () => void;
  setActiveView: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, toggleSidebar, notifications, markNotificationsAsRead, setActiveView }) => {
  const [isPanelOpen, setPanelOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
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

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md z-10">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-slate-500 focus:outline-none lg:hidden mr-4">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-slate-800">InFort RH</h1>
      </div>
      <div className="flex items-center space-x-4">
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
        <div className="text-right">
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