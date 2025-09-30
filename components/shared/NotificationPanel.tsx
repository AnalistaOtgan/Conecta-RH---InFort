import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNotification } from '../../types';

interface NotificationPanelProps {
  notifications: AppNotification[];
  onClose: () => void;
}

const timeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} anos atrás`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} meses atrás`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} dias atrás`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} horas atrás`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutos atrás`;
    return 'Agora mesmo';
};


const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose }) => {
  const navigate = useNavigate();
  
  const handleNotificationClick = (notification: AppNotification) => {
    navigate(`/${notification.link}`);
    onClose();
  };
  
  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in-down">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Notificações</h3>
        <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
             <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
      {notifications.length === 0 ? (
        <div className="p-6 text-center text-slate-500">
          <p>Nenhuma notificação nova.</p>
        </div>
      ) : (
        <ul className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {notifications.map(n => (
            <li key={n.id}>
              <button
                onClick={() => handleNotificationClick(n)}
                className={`w-full text-left p-4 transition-colors ${!n.read ? 'bg-slate-50 hover:bg-slate-100' : 'bg-white hover:bg-slate-50'}`}
              >
                <p className="text-sm text-slate-700">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{timeAgo(n.timestamp)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPanel;