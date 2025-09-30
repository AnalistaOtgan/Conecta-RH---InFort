import React from 'react';
import { Announcement } from '../../types';

interface AnnouncementsProps {
  announcements: Announcement[];
}

const Announcements: React.FC<AnnouncementsProps> = ({ announcements }) => {
  return (
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
            <div key={ann.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              {ann.imageUrl && (
                <div className="aspect-w-16 aspect-h-9">
                    <img src={ann.imageUrl} alt={ann.title} className="w-full h-48 object-cover" />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm text-slate-500 mb-2">{new Date(ann.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                <h3 className="text-xl font-semibold text-slate-900 flex-grow">{ann.title}</h3>
                {ann.content && (
                  <p className="mt-2 text-slate-600 text-sm line-clamp-3">{ann.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;