
import React from 'react';
import { Announcement } from '../../types';

interface AnnouncementsProps {
  announcements: Announcement[];
}

const Announcements: React.FC<AnnouncementsProps> = ({ announcements }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Informativos</h2>
      {announcements.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-slate-500">
          Nenhum informativo publicado no momento.
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow-md transition-shadow hover:shadow-lg overflow-hidden">
              {announcement.imageUrl && (
                <img src={announcement.imageUrl} alt={announcement.title} className="w-full h-56 object-cover" />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-slate-900">{announcement.title}</h3>
                  <span className="text-sm text-slate-500 flex-shrink-0 ml-4">{new Date(announcement.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                </div>
                {announcement.content && (
                  <p className="mt-2 text-slate-600">{announcement.content}</p>
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