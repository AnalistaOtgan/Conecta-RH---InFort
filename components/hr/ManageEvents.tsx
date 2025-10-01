
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Event, User, Role } from '../../types';
import ConfirmationDialog from '../shared/ConfirmationDialog';

interface EventEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  employees: User[];
  onUpdate: (eventId: string, eventData: Partial<Omit<Event, 'id'>>) => void;
}

const EventEditModal: React.FC<EventEditModalProps> = ({ isOpen, onClose, event, employees, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [participantIds, setParticipantIds] = useState<number[]>([]);
  const [reminder, setReminder] = useState<number>(0);
  const [error, setError] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      // Format datetime-local requires YYYY-MM-DDTHH:mm
      const localDateTime = new Date(new Date(event.dateTime).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setDateTime(localDateTime);
      setParticipantIds(event.participantIds);
      setReminder(event.reminderMinutesBefore || 0);
      setParticipantSearch('');
    }
  }, [event]);
  
  const filteredEmployeesForEdit = useMemo(() => {
    if (!participantSearch) return employees;
    return employees.filter(emp => emp.name.toLowerCase().includes(participantSearch.toLowerCase()));
  }, [employees, participantSearch]);

  if (!isOpen || !event) return null;

  const handleParticipantChange = (employeeId: number) => {
    setParticipantIds(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateTime || participantIds.length === 0) {
      setError('Título, data/hora e ao menos um participante são obrigatórios.');
      return;
    }
    setError('');
    onUpdate(event.id, { 
        title, 
        description, 
        dateTime: new Date(dateTime).toISOString(),
        participantIds,
        reminderMinutesBefore: reminder > 0 ? reminder : undefined 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 transition-opacity" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Remarcar Evento</h3>
                <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label htmlFor="edit-title" className="block text-sm font-medium text-slate-700">Título do Evento</label>
                        <input type="text" id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800" required />
                    </div>
                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-slate-700">Descrição (Opcional)</label>
                        <textarea id="edit-description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full bg-white border border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="edit-dateTime" className="block text-sm font-medium text-slate-700">Data e Hora</label>
                            <input type="datetime-local" id="edit-dateTime" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800" required />
                        </div>
                        <div>
                            <label htmlFor="edit-reminder" className="block text-sm font-medium text-slate-700">Lembrete</label>
                            <select id="edit-reminder" value={reminder} onChange={(e) => setReminder(Number(e.target.value))} className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800">
                                <option value={0}>Sem lembrete</option>
                                <option value={15}>15 minutos antes</option>
                                <option value={30}>30 minutos antes</option>
                                <option value={60}>1 hora antes</option>
                                <option value={120}>2 horas antes</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Participantes</label>
                        <div className="mt-2">
                             <input
                                type="text"
                                placeholder="Buscar participante..."
                                value={participantSearch}
                                onChange={(e) => setParticipantSearch(e.target.value)}
                                className="mb-2 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                            />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border border-slate-300 rounded-md p-4 max-h-60 overflow-y-auto">
                            {filteredEmployeesForEdit.map(employee => (
                                <div key={employee.id} className="flex items-center">
                                <input
                                    id={`edit-employee-${employee.id}`}
                                    type="checkbox"
                                    checked={participantIds.includes(employee.id)}
                                    onChange={() => handleParticipantChange(employee.id)}
                                    className="h-4 w-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
                                />
                                <label htmlFor={`edit-employee-${employee.id}`} className="ml-3 text-sm text-gray-700">{employee.name}</label>
                                </div>
                            ))}
                             {filteredEmployeesForEdit.length === 0 && (
                                <p className="col-span-full text-center text-sm text-slate-500">Nenhum funcionário encontrado.</p>
                            )}
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                 <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-slate-800 text-sm font-medium text-white border border-transparent rounded-md hover:bg-slate-900">Salvar Alterações</button>
                </div>
            </form>
        </div>
    </div>
  );
}

interface ManageEventsProps {
  user: User;
  events: Event[];
  employees: User[];
  onCreate: (event: Omit<Event, 'id'>) => void;
  onUpdate: (eventId: string, eventData: Partial<Omit<Event, 'id'>>) => void;
  onDelete: (eventId: string) => void;
}

const ManageEvents: React.FC<ManageEventsProps> = ({ user, events, employees, onCreate, onUpdate, onDelete }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [participantIds, setParticipantIds] = useState<number[]>([]);
  const [reminder, setReminder] = useState<number>(0);
  const [error, setError] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmDetails, setConfirmDetails] = useState({ title: '', message: '', confirmText: '' });
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ARCHIVED' | 'ALL'>('ACTIVE');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenActionMenu(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleParticipantChange = (employeeId: number) => {
    setParticipantIds(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateTime || participantIds.length === 0) {
      setError('Título, data/hora e ao menos um participante são obrigatórios.');
      return;
    }
    setError('');
    onCreate({ 
        title, 
        description, 
        dateTime: new Date(dateTime).toISOString(), 
        participantIds,
        reminderMinutesBefore: reminder > 0 ? reminder : undefined 
    });
    // Reset form
    setTitle('');
    setDescription('');
    setDateTime('');
    setParticipantIds([]);
    setReminder(0);
    setParticipantSearch('');
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
    setOpenActionMenu(null);
  };
  
  const handleArchiveClick = (event: Event) => {
      setConfirmDetails({
          title: "Arquivar Evento",
          message: `Tem certeza que deseja arquivar o evento "${event.title}"? Ele não será mais exibido para os participantes.`,
          confirmText: "Sim, Arquivar"
      });
      setConfirmAction(() => () => onUpdate(event.id, { status: 'ARCHIVED' }));
      setIsConfirmOpen(true);
      setOpenActionMenu(null);
  };
  
  const handleDeleteClick = (event: Event) => {
      setConfirmDetails({
          title: "Excluir Evento",
          message: `Tem certeza que deseja excluir o evento "${event.title}" permanentemente? Esta ação é irreversível.`,
          confirmText: "Sim, Excluir"
      });
      setConfirmAction(() => () => onDelete(event.id));
      setIsConfirmOpen(true);
      setOpenActionMenu(null);
  };

  const handleReactivateClick = (event: Event) => {
      onUpdate(event.id, { status: 'ACTIVE' });
      setOpenActionMenu(null);
  };

  const handleConfirm = () => {
    if (confirmAction) {
        confirmAction();
    }
    setIsConfirmOpen(false);
  };

  const filteredEvents = useMemo(() => {
    if (statusFilter === 'ALL') return events;
    return events.filter(e => (e.status || 'ACTIVE') === statusFilter);
  }, [events, statusFilter]);
  
  const filteredEmployeesForCreate = useMemo(() => {
    if (!participantSearch) return employees;
    return employees.filter(emp => emp.name.toLowerCase().includes(participantSearch.toLowerCase()));
  }, [employees, participantSearch]);
  
  const getParticipantNames = (ids: number[]): string => {
    if (ids.length > 3) {
        const firstThree = ids.slice(0, 3).map(id => employees.find(e => e.id === id)?.name.split(' ')[0] || 'Desconhecido').join(', ');
        return `${firstThree} e mais ${ids.length - 3}...`;
    }
    return ids.map(id => employees.find(e => e.id === id)?.name || 'Desconhecido').join(', ');
  }

  const getReminderText = (minutes?: number) => {
      if (!minutes) return '';
      if (minutes === 60) return '1 hora antes';
      if (minutes > 60 && minutes % 60 === 0) return `${minutes / 60} horas antes`;
      return `${minutes} minutos antes`;
  };

  const getStatusChip = (status: 'ACTIVE' | 'ARCHIVED' | undefined) => {
      const s = status || 'ACTIVE';
      const colors = s === 'ACTIVE' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800';
      const text = s === 'ACTIVE' ? 'Ativo' : 'Arquivado';
      return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors}`}>{text}</span>;
  };

  return (
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Criar Novo Evento</h2>
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título do Evento</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição (Opcional)</label>
            <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full bg-white border border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label htmlFor="dateTime" className="block text-sm font-medium text-slate-700">Data e Hora</label>
                <input type="datetime-local" id="dateTime" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800" required />
            </div>
            <div>
                <label htmlFor="reminder" className="block text-sm font-medium text-slate-700">Lembrete</label>
                <select id="reminder" value={reminder} onChange={(e) => setReminder(Number(e.target.value))} className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800">
                    <option value={0}>Sem lembrete</option>
                    <option value={15}>15 minutos antes</option>
                    <option value={30}>30 minutos antes</option>
                    <option value={60}>1 hora antes</option>
                    <option value={120}>2 horas antes</option>
                </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Participantes</label>
            <div className="mt-2">
                <input
                    type="text"
                    placeholder="Buscar participante..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="mb-2 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border border-slate-300 rounded-md p-4 max-h-60 overflow-y-auto">
                {filteredEmployeesForCreate.map(employee => (
                    <div key={employee.id} className="flex items-center">
                    <input
                        id={`employee-${employee.id}`}
                        type="checkbox"
                        checked={participantIds.includes(employee.id)}
                        onChange={() => handleParticipantChange(employee.id)}
                        className="h-4 w-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
                    />
                    <label htmlFor={`employee-${employee.id}`} className="ml-3 text-sm text-gray-700">{employee.name}</label>
                    </div>
                ))}
                {filteredEmployeesForCreate.length === 0 && (
                    <p className="col-span-full text-center text-sm text-slate-500">Nenhum funcionário encontrado.</p>
                )}
                </div>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">
              Criar Evento
            </button>
          </div>
        </form>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Eventos Agendados</h2>
            <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value as any)}
                className="block pl-3 pr-10 py-2 text-base bg-white text-slate-800 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
            >
                <option value="ACTIVE">Ativos</option>
                <option value="ARCHIVED">Arquivados</option>
                <option value="ALL">Todos</option>
            </select>
        </div>
        {filteredEvents.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-slate-500">
            Nenhum evento encontrado para este filtro.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredEvents.map(event => (
                <li key={event.id} className={`p-4 sm:p-6 ${(event.status === 'ARCHIVED') ? 'bg-slate-50' : ''}`}>
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                        <div className="flex items-center gap-x-3 mt-1">
                            {getStatusChip(event.status)}
                            <p className="text-sm text-slate-500 font-medium">{new Date(event.dateTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                        </div>
                    </div>
                    <div className="relative" ref={openActionMenu === event.id ? menuRef : null}>
                        <button onClick={() => setOpenActionMenu(openActionMenu === event.id ? null : event.id)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </button>
                        {openActionMenu === event.id && (
                           <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                    {event.status !== 'ARCHIVED' ? (
                                        <>
                                            <button onClick={() => handleEditClick(event)} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                                <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                                                Remarcar
                                            </button>
                                            <button onClick={() => handleArchiveClick(event)} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                                <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                                Arquivar
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => handleReactivateClick(event)} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                            <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9a9 9 0 0114.13-5.22M20 15a9 9 0 01-14.13 5.22" /></svg>
                                            Reativar
                                        </button>
                                    )}
                                    { user.role === Role.ADMIN && 
                                        <button onClick={() => handleDeleteClick(event)} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50" role="menuitem">
                                            <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Excluir
                                        </button>
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                  {event.description && <p className="mt-2 text-sm text-slate-600">{event.description}</p>}
                  <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700">Participantes ({event.participantIds.length}):</p>
                      <p className="text-sm text-slate-500">{getParticipantNames(event.participantIds)}</p>
                  </div>
                   {event.reminderMinutesBefore && (
                    <div className="mt-2 flex items-center text-sm text-slate-500">
                      <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      <span>Lembrete: {getReminderText(event.reminderMinutesBefore)}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <EventEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={editingEvent}
        employees={employees}
        onUpdate={onUpdate}
      />
      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        title={confirmDetails.title}
        message={confirmDetails.message}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
        confirmText={confirmDetails.confirmText}
      />
    </div>
  );
};

export default ManageEvents;
