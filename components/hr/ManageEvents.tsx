import React, { useState } from 'react';
import { Event, User } from '../../types';

interface ManageEventsProps {
  events: Event[];
  employees: User[];
  onSubmit: (event: Omit<Event, 'id'>) => void;
}

const ManageEvents: React.FC<ManageEventsProps> = ({ events, employees, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [participantIds, setParticipantIds] = useState<number[]>([]);
  const [error, setError] = useState('');

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
    onSubmit({ title, description, dateTime, participantIds });
    // Reset form
    setTitle('');
    setDescription('');
    setDateTime('');
    setParticipantIds([]);
  };
  
  const getParticipantNames = (ids: number[]): string => {
    if (ids.length > 3) {
        const firstThree = ids.slice(0, 3).map(id => employees.find(e => e.id === id)?.name.split(' ')[0] || 'Desconhecido').join(', ');
        return `${firstThree} e mais ${ids.length - 3}...`;
    }
    return ids.map(id => employees.find(e => e.id === id)?.name || 'Desconhecido').join(', ');
  }

  return (
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Criar Novo Evento</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título do Evento</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição (Opcional)</label>
            <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full bg-white border border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"></textarea>
          </div>
          <div>
            <label htmlFor="dateTime" className="block text-sm font-medium text-slate-700">Data e Hora</label>
            <input type="datetime-local" id="dateTime" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Participantes</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 border border-slate-300 rounded-md p-4 max-h-60 overflow-y-auto">
              {employees.map(employee => (
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
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Eventos Agendados</h2>
        {events.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-slate-500">
            Nenhum evento agendado.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {events.map(event => (
                <li key={event.id} className="p-4 sm:p-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">{new Date(event.dateTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                  </div>
                  {event.description && <p className="mt-2 text-sm text-slate-600">{event.description}</p>}
                  <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700">Participantes ({event.participantIds.length}):</p>
                      <p className="text-sm text-slate-500">{getParticipantNames(event.participantIds)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;