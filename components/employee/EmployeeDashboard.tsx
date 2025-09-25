
import React from 'react';
import { User, Announcement } from '../../types';

interface EmployeeDashboardProps {
  user: User;
  announcements: Announcement[];
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, announcements }) => {
  const latestAnnouncements = announcements.slice(0, 3);

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Bem-vindo(a), {user.name.split(' ')[0]}!</h2>
      <p className="text-slate-600 mb-8">Aqui está um resumo rápido das suas informações e atividades recentes.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Últimos Informativos</h3>
          {latestAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {latestAnnouncements.map((ann) => (
                <div key={ann.id} className="border-b border-slate-200 pb-4 last:border-b-0">
                   {ann.imageUrl && (
                    <img src={ann.imageUrl} alt={ann.title} className="w-full h-40 object-cover rounded-md mb-3" />
                  )}
                  <div className="flex justify-between items-center">
                     <p className="font-medium text-slate-800">{ann.title}</p>
                     <span className="text-sm text-slate-500">{new Date(ann.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                  </div>
                  {ann.content && (
                    <p className="text-sm text-slate-600 mt-1">{ann.content}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">Não há informativos recentes.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;