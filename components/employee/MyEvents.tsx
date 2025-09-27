import React from 'react';
import { Event } from '../../types';

interface MyEventsProps {
  events: Event[];
}

const MyEvents: React.FC<MyEventsProps> = ({ events }) => {
  const sortedEvents = [...events].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  
  const getReminderText = (minutes?: number) => {
      if (!minutes) return '';
      if (minutes === 60) return '1 hora antes';
      if (minutes > 60 && minutes % 60 === 0) return `${minutes / 60} horas antes`;
      return `${minutes} minutos antes`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Meus Eventos</h2>
      {sortedEvents.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-slate-500">
          Você não foi convidado para nenhum evento no momento.
        </div>
      ) : (
        <div className="space-y-6">
          {sortedEvents.map((event) => {
            const isPast = new Date(event.dateTime) < new Date();
            return (
              <div key={event.id} className={`bg-white rounded-lg shadow-md transition-shadow hover:shadow-lg overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
                <div className="p-6">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900">{event.title}</h3>
                        {isPast && <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">REALIZADO</span>}
                    </div>
                    <span className="text-sm text-slate-600 font-medium flex-shrink-0 ml-4 bg-slate-100 px-2 py-1 rounded-full">{new Date(event.dateTime).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</span>
                  </div>
                  {event.description && (
                    <p className="mt-4 text-slate-600">{event.description}</p>
                  )}
                  {event.reminderMinutesBefore && !isPast && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-sm text-slate-500">
                       <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      <span>Lembrete será enviado {getReminderText(event.reminderMinutesBefore)}.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyEvents;