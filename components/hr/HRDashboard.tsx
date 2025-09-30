

import React from 'react';
import { TimeOffRequest, MeetingRequest, RequestStatus } from '../../types';

interface HRDashboardProps {
  timeOffRequests: TimeOffRequest[];
  meetingRequests: MeetingRequest[];
}

// FIX: Replaced JSX.Element with React.ReactElement to resolve 'JSX' namespace error.
const StatCard: React.FC<{ title: string, value: number, icon: React.ReactElement }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-slate-100 p-3 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);


const HRDashboard: React.FC<HRDashboardProps> = ({ timeOffRequests, meetingRequests }) => {
  const pendingTimeOff = timeOffRequests.filter(r => r.status === RequestStatus.PENDENTE).length;
  const pendingMeetings = meetingRequests.filter(r => r.status === RequestStatus.PENDENTE).length;

  const recentPendingTimeOff = timeOffRequests
    .filter(r => r.status === RequestStatus.PENDENTE)
    .slice(0, 3);

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Dashboard de RH</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
            title="Folgas Pendentes" 
            value={pendingTimeOff}
            icon={<svg className="h-6 w-6 text-slate-600" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>}
        />
        <StatCard 
            title="Reuniões Pendentes" 
            value={pendingMeetings}
            icon={<svg className="h-6 w-6 text-slate-600" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Solicitações de Folga Recentes</h3>
        {recentPendingTimeOff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Funcionário</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Período</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {recentPendingTimeOff.map(req => (
                        <tr key={req.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{req.userName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(req.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} - {new Date(req.endDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{req.type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">Nenhuma solicitação pendente no momento.</p>
        )}
      </div>
    </div>
  );
};

export default HRDashboard;