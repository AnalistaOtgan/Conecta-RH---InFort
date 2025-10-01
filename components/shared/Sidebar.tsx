
import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Role } from '../../types';

interface SidebarProps {
  user: User;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, setOpen }) => {

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) { // lg breakpoint
      setOpen(false);
    }
  };
    
  const employeeLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z"/></svg> },
    { to: '/announcements', label: 'Informativos', icon: <svg className="h-5 w-5" viewBox="0 0 428.108 428.108" fill="currentColor"><path d="M236.503,387.867c0,3.866-3.134,7-7,7h-30.898c-3.866,0-7-3.134-7-7s3.134-7,7-7h30.898 C233.369,380.867,236.503,384,236.503,387.867z M314.878,144.35c0,12.285-4.131,23.625-11.076,32.702 c7.079,13.78,11.076,29.392,11.076,45.92c0,55.595-45.229,100.825-100.825,100.825c-55.595,0-100.825-45.23-100.825-100.825 c0-54.853,44.028-99.615,98.601-100.802c8.473-18.695,27.312-31.733,49.137-31.733C290.693,90.437,314.878,114.623,314.878,144.35z M221.054,144.35c0,22.008,17.904,39.913,39.912,39.913c9.671,0,18.551-3.458,25.466-9.202 c-14.213-21.399-37.658-36.167-64.602-38.569C221.32,139.033,221.054,141.661,221.054,144.35z M300.878,222.972 c0-12.638-2.715-24.655-7.591-35.498c-9.012,6.772-20.206,10.789-32.321,10.789c-29.728,0-53.913-24.186-53.913-53.913 c0-2.707,0.201-5.368,0.588-7.97c-44.893,3.293-80.413,40.872-80.413,86.592c0,47.876,38.949,86.825,86.825,86.825 S300.878,270.848,300.878,222.972z M300.878,144.35c0-22.008-17.904-39.913-39.912-39.913c-14.163,0-26.628,7.417-33.714,18.569 c28.1,3.689,52.593,18.996,68.486,40.923C299.01,158.141,300.878,151.46,300.878,144.35z M252.177,355.057h-76.244 c-3.866,0-7,3.134-7,7s3.134,7,7,7h76.244c3.866,0,7-3.134,7-7S256.043,355.057,252.177,355.057z M379.295,49.957v371.151 c0,3.866-3.134,7-7,7H55.813c-3.866,0-7-3.134-7-7V49.957c0-3.866,3.134-7,7-7h68.925l86.236-42.243 c1.943-0.951,4.216-0.951,6.159,0l86.236,42.243h68.925C376.161,42.957,379.295,46.09,379.295,49.957z M156.563,42.957h114.983 l-57.492-28.162L156.563,42.957z M365.295,56.957h-63.404c-0.098,0.003-0.196,0.003-0.296,0H126.514 c-0.099,0.002-0.198,0.002-0.296,0H62.813v357.151h302.482V56.957z"/></svg> },
    { to: '/payslips', label: 'Meus Contracheques', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M13.17 4L18 8.83V20H6V4h7.17M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm1 9h-4v1h3c.55 0 1 .45 1 1v3c0 .55-.45 1-1 1h-1v1h-2v-1H9v-2h4v-1h-3c-.55 0-1-.45-1-1v-3c0 .55.45-1 1-1h1V8h2v1h2v2z"/></svg> },
    { to: '/request-timeoff', label: 'Solicitar Folga', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg> },
    { to: '/schedule-meeting', label: 'Agendar Reunião', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg> },
    { to: '/my-events', label: 'Meus Eventos', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg> },
  ];
  
  const hrLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z"/></svg> },
    { to: '/announcements', label: 'Informativos', icon: <svg className="h-5 w-5" viewBox="0 0 428.108 428.108" fill="currentColor"><path d="M236.503,387.867c0,3.866-3.134,7-7,7h-30.898c-3.866,0-7-3.134-7-7s3.134-7,7-7h30.898 C233.369,380.867,236.503,384,236.503,387.867z M314.878,144.35c0,12.285-4.131,23.625-11.076,32.702 c7.079,13.78,11.076,29.392,11.076,45.92c0,55.595-45.229,100.825-100.825,100.825c-55.595,0-100.825-45.23-100.825-100.825 c0-54.853,44.028-99.615,98.601-100.802c8.473-18.695,27.312-31.733,49.137-31.733C290.693,90.437,314.878,114.623,314.878,144.35z M221.054,144.35c0,22.008,17.904,39.913,39.912,39.913c9.671,0,18.551-3.458,25.466-9.202 c-14.213-21.399-37.658-36.167-64.602-38.569C221.32,139.033,221.054,141.661,221.054,144.35z M300.878,222.972 c0-12.638-2.715-24.655-7.591-35.498c-9.012,6.772-20.206,10.789-32.321,10.789c-29.728,0-53.913-24.186-53.913-53.913 c0-2.707,0.201-5.368,0.588-7.97c-44.893,3.293-80.413,40.872-80.413,86.592c0,47.876,38.949,86.825,86.825,86.825 S300.878,270.848,300.878,222.972z M300.878,144.35c0-22.008-17.904-39.913-39.912-39.913c-14.163,0-26.628,7.417-33.714,18.569 c28.1,3.689,52.593,18.996,68.486,40.923C299.01,158.141,300.878,151.46,300.878,144.35z M252.177,355.057h-76.244 c-3.866,0-7,3.134-7,7s3.134,7,7,7h76.244c3.866,0,7-3.134,7-7S256.043,355.057,252.177,355.057z M379.295,49.957v371.151 c0,3.866-3.134,7-7,7H55.813c-3.866,0-7-3.134-7-7V49.957c0-3.866,3.134-7,7-7h68.925l86.236-42.243 c1.943-0.951,4.216-0.951,6.159,0l86.236,42.243h68.925C376.161,42.957,379.295,46.09,379.295,49.957z M156.563,42.957h114.983 l-57.492-28.162L156.563,42.957z M365.295,56.957h-63.404c-0.098,0.003-0.196,0.003-0.296,0H126.514 c-0.099,0.002-0.198,0.002-0.296,0H62.813v357.151h302.482V56.957z"/></svg> },
    { to: '/payslips', label: 'Meus Contracheques', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M13.17 4L18 8.83V20H6V4h7.17M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm1 9h-4v1h3c.55 0 1 .45 1 1v3c0 .55-.45 1-1 1h-1v1h-2v-1H9v-2h4v-1h-3c-.55 0-1-.45-1-1v-3c0 .55.45-1 1-1h1V8h2v1h2v2z"/></svg> },
    { to: '/manage-timeoff', label: 'Gerenciar Folgas', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg> },
    { to: '/manage-meetings', label: 'Gerenciar Reuniões', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 15h7v2H7zm0-4h10v2H7zm0-4h10v2H7zm12-4h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-.14 0-.27.01-.4.04a2.008 2.008 0 0 0-1.44 1.19c-.1.23-.16.49-.16.77v14c0 .27.06.54.16.78s.25.45.43.64c.27.27.62.47 1.01.55c.13.02.26.03.4.03h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7-.25c.41 0 .75.34.75.75s-.34.75-.75.75s-.75-.34-.75-.75s.34-.75.75-.75zM19 19H5V5h14v14z"/></svg> },
    { to: '/upload-payslip', label: 'Lançar Contracheque', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M13.17 4L18 8.83V20H6V4h7.17M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm1 9h-4v1h3c.55 0 1 .45 1 1v3c0 .55-.45 1-1 1h-1v1h-2v-1H9v-2h4v-1h-3c-.55 0-1-.45-1-1v-3c0 .55.45-1 1-1h1V8h2v1h2v2z"/></svg> },
    { to: '/post-announcement', label: 'Publicar Informativo', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="9" r="4"/><path d="M9 15c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7.76-9.64l-1.68 1.69c.84 1.18.84 2.71 0 3.89l1.68 1.69c2.02-2.02 2.02-5.07 0-7.27zM20.07 2l-1.63 1.63c2.77 3.02 2.77 7.56 0 10.74L20.07 16c3.9-3.89 3.91-9.95 0-14z"/></svg> },
    { to: '/manage-employees', label: 'Gerenciar Funcionários', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><circle cx="10" cy="8" r="4"/><path d="M10.67 13.02c-.22-.01-.44-.02-.67-.02c-2.42 0-4.68.67-6.61 1.82c-.88.52-1.39 1.5-1.39 2.53V20h9.26a6.963 6.963 0 0 1-.59-6.98zM20.75 16c0-.22-.03-.42-.06-.63l1.14-1.01l-1-1.73l-1.45.49c-.32-.27-.68-.48-1.08-.63L18 11h-2l-.3 1.49c-.4.15-.76.36-1.08.63l-1.45-.49l-1 1.73l1.14 1.01c-.03.21-.06.41-.06.63s.03.42.06.63l-1.14 1.01l1 1.73l1.45-.49c.32.27.68.48 1.08.63L16 21h2l.3-1.49c.4-.15.76.36 1.08-.63l1.45.49l1-1.73l-1.14-1.01c.03-.21.06-.41.06-.63zM17 18c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2z"/></svg> },
    { to: '/manage-events', label: 'Gerenciar Eventos', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg> },
    { to: '/activity-log', label: 'Log de Atividades', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1c-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29c-3.51 3.48-9.21 3.48-12.72 0c-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08l-.72 1.21L11 13V8h1.5z"/></svg> },
    { href: 'http://fmarechal.com/feedfort/', label: 'Sistema de Feedback', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23 8c0 1.1-.9 2-2 2a1.7 1.7 0 0 1-.51-.07l-3.56 3.55c.05.16.07.34.07.52c0 1.1-.9 2-2 2s-2-.9-2-2c0-.18.02-.36.07-.52l-2.55-2.55c-.16.05-.34.07-.52.07s-.36-.02-.52-.07l-4.55 4.56c.05.16.07.33.07.51c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2c.18 0 .35.02.51.07l4.56-4.55C8.02 9.36 8 9.18 8 9c0-1.1.9-2 2-2s2 .9 2 2c0 .18-.02.36-.07.52l2.55 2.55c.16-.05.34-.07.52-.07s.36.02.52.07l3.55-3.56A1.7 1.7 0 0 1 19 8c0-1.1.9-2 2-2s2 .9 2 2z"/></svg> },
  ];

  const links: Array<{ to?: string; href?: string; label: string; icon: React.ReactElement; }> = 
    user.role === Role.FUNCIONARIO ? employeeLinks
    : user.role === Role.ADMIN ? hrLinks
    : hrLinks.filter(link => link.to !== '/activity-log');

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      ></div>
      <aside className={`absolute inset-y-0 left-0 bg-white shadow-xl w-64 z-30 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center p-4 border-b">
          <svg className="w-10 h-10 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          <span className="text-xl font-bold ml-2">InFort RH</span>
        </div>
        <nav className="p-4">
            <ul className="space-y-2">
                {links.map((link) => (
                    <li key={link.label}>
                       {link.href ? (
                            <a href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-slate-600 hover:bg-slate-200 hover:text-slate-800 justify-between">
                                <div className="flex items-center">
                                    {link.icon}
                                    <span className="ml-3">{link.label}</span>
                                </div>
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </a>
                       ) : (
                           <NavLink 
                             to={link.to!}
                             onClick={handleLinkClick}
                             className={({ isActive }) => 
                               `flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                 isActive
                                   ? 'bg-slate-800 text-white'
                                   : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                               }`
                             }
                           >
                            {link.icon}
                            <span className="ml-3">{link.label}</span>
                           </NavLink>
                       )}
                    </li>
                ))}
            </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
