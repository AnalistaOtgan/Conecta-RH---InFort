
import React, { useState, useRef, useEffect } from 'react';
import { Announcement, User, Role } from '../../types';
import ConfirmationDialog from './ConfirmationDialog';

interface AnnouncementsProps {
  user: User;
  announcements: Announcement[];
  onAnnouncementClick: (announcement: Announcement) => void;
  onUpdateStatus: (announcementId: string, status: 'ACTIVE' | 'ARCHIVED') => void;
  onDelete: (announcementId: string) => void;
}

const Announcements: React.FC<AnnouncementsProps> = ({ user, announcements, onAnnouncementClick, onUpdateStatus, onDelete }) => {
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmDetails, setConfirmDetails] = useState({ title: '', message: '', confirmText: '' });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenActionMenu(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirm = () => {
    if (confirmAction) {
        confirmAction();
    }
    setIsConfirmOpen(false);
  };

  const handleAction = (action: () => void, {title, message, confirmText}: any) => {
    setConfirmDetails({ title, message, confirmText });
    setConfirmAction(() => () => action());
    setIsConfirmOpen(true);
    setOpenActionMenu(null);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Informativos</h2>
        </div>
        {announcements.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-slate-500">
            Nenhum informativo publicado no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left w-full relative">
                {(user.role === Role.RH || user.role === Role.ADMIN) && (
                   <div className="absolute top-2 right-2 z-10" ref={openActionMenu === ann.id ? menuRef : null}>
                       <button onClick={() => setOpenActionMenu(openActionMenu === ann.id ? null : ann.id)} className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                       </button>
                       {openActionMenu === ann.id && (
                           <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                               <div className="py-1" role="menu">
                                  {ann.status !== 'ARCHIVED' ? (
                                    <button onClick={() => handleAction(() => onUpdateStatus(ann.id, 'ARCHIVED'), {title: 'Arquivar Informativo', message: `Arquivar "${ann.title}"?`, confirmText: 'Sim, Arquivar'})} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Arquivar</button>
                                  ) : (
                                    <button onClick={() => onUpdateStatus(ann.id, 'ACTIVE')} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Reativar</button>
                                  )}
                                  {user.role === Role.ADMIN && 
                                    <button onClick={() => handleAction(() => onDelete(ann.id), {title: 'Excluir Informativo', message: `Excluir "${ann.title}" permanentemente?`, confirmText: 'Sim, Excluir'})} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50">Excluir</button>
                                  }
                               </div>
                           </div>
                       )}
                   </div>
                )}
                <button
                  onClick={() => onAnnouncementClick(ann)}
                  className="w-full h-full"
                  disabled={!!openActionMenu}
                >
                  {ann.imageUrl && (
                    <div className="aspect-w-16 aspect-h-9">
                        <img src={ann.imageUrl} alt={ann.title} className="w-full h-48 object-cover" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className='flex justify-between items-center'>
                      <p className="text-sm text-slate-500 mb-2">{new Date(ann.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                      {ann.status === 'ARCHIVED' && <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">Arquivado</span>}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 flex-grow">{ann.title}</h3>
                    {ann.content && (
                      <p className="mt-2 text-slate-600 text-sm line-clamp-3" style={{ whiteSpace: 'pre-wrap' }}>{ann.content}</p>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmationDialog isOpen={isConfirmOpen} title={confirmDetails.title} message={confirmDetails.message} onConfirm={handleConfirm} onCancel={() => setIsConfirmOpen(false)} confirmText={confirmDetails.confirmText} />
    </>
  );
};

export default Announcements;
