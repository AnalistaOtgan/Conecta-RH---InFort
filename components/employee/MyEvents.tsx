import React from 'react';
import { Event } from '../../types';

interface MyEventsProps {
  events: Event[];
}

const MyEvents: React.FC<MyEventsProps> = ({ events }) => {
  const sortedEvents = [...events].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

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
