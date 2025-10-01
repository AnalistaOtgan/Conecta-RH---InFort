import React, { useState, useMemo } from 'react';
import { LogEntry, User, LogActionType } from '../../types';

interface ActivityLogProps {
  logs: LogEntry[];
  adminUsers: User[];
}

const actionColors: { [key in LogActionType]: string } = {
    [LogActionType.CADASTRO_USUARIO]: 'bg-blue-100 text-blue-800',
    [LogActionType.IMPORTACAO_USUARIOS]: 'bg-blue-100 text-blue-800',
    [LogActionType.ATUALIZACAO_STATUS_USUARIO]: 'bg-yellow-100 text-yellow-800',
    [LogActionType.ATUALIZACAO_DADOS_USUARIO]: 'bg-yellow-100 text-yellow-800',
    [LogActionType.RESET_SENHA]: 'bg-yellow-100 text-yellow-800',
    [LogActionType.PROMOCAO_CARGO]: 'bg-purple-100 text-purple-800',
    [LogActionType.APROVACAO_FOLGA]: 'bg-green-100 text-green-800',
    [LogActionType.NEGACAO_FOLGA]: 'bg-red-100 text-red-800',
    // FIX: Added missing log action types for medical certificates.
    [LogActionType.ENVIO_ATESTADO]: 'bg-cyan-100 text-cyan-800',
    [LogActionType.APROVACAO_ATESTADO]: 'bg-green-100 text-green-800',
    [LogActionType.NEGACAO_ATESTADO]: 'bg-red-100 text-red-800',
    [LogActionType.APROVACAO_REUNIAO]: 'bg-green-100 text-green-800',
    [LogActionType.NEGACAO_REUNIAO]: 'bg-red-100 text-red-800',
    [LogActionType.LANCAMENTO_CONTRACHEQUE]: 'bg-indigo-100 text-indigo-800',
    [LogActionType.PUBLICACAO_INFORMATIVO]: 'bg-cyan-100 text-cyan-800',
    [LogActionType.CRIACAO_EVENTO]: 'bg-blue-100 text-blue-800',
    [LogActionType.ATUALIZACAO_EVENTO]: 'bg-yellow-100 text-yellow-800',
    [LogActionType.ARQUIVAMENTO_REGISTRO]: 'bg-slate-100 text-slate-800',
    [LogActionType.EXCLUSAO_PERMANENTE]: 'bg-red-100 text-red-800',
};

const ActivityLog: React.FC<ActivityLogProps> = ({ logs, adminUsers }) => {
  const [adminFilter, setAdminFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const adminMatch = adminFilter === 'ALL' || log.adminId === Number(adminFilter);
      const actionMatch = actionFilter === 'ALL' || log.action === actionFilter;
      
      const logDate = new Date(log.timestamp);
      // Adjust start date to be beginning of the day and end date to be end of the day for inclusive filtering
      const startMatch = !startDate || logDate >= new Date(startDate + 'T00:00:00');
      const endMatch = !endDate || logDate <= new Date(endDate + 'T23:59:59');

      return adminMatch && actionMatch && startMatch && endMatch;
    });
  }, [logs, adminFilter, actionFilter, startDate, endDate]);
  
  const clearFilters = () => {
    setAdminFilter('ALL');
    setActionFilter('ALL');
    setStartDate('');
    setEndDate('');
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Log de Atividades</h2>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:flex-wrap gap-2 items-center">
            <div className="flex items-center space-x-2">
                <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="block w-full sm:w-auto pl-3 pr-2 py-2 text-base bg-white text-slate-800 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
                    aria-label="Data de Início"
                />
                 <span className="text-slate-500">até</span>
                <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    min={startDate}
                    className="block w-full sm:w-auto pl-3 pr-2 py-2 text-base bg-white text-slate-800 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
                    aria-label="Data de Fim"
                />
            </div>
            <select
              value={adminFilter}
              onChange={e => setAdminFilter(e.target.value)}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base bg-white text-slate-800 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
              aria-label="Filtrar por administrador"
            >
              <option value="ALL">Todos os Admins</option>
              {adminUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base bg-white text-slate-800 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
              aria-label="Filtrar por tipo de ação"
            >
              <option value="ALL">Todas as Ações</option>
              {Object.values(LogActionType).sort().map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <button onClick={clearFilters} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md transition-colors">Limpar Filtros</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data/Hora</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Administrador</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ação</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Detalhes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{log.adminName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${actionColors[log.action] || 'bg-gray-100 text-gray-800'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm text-slate-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            <p>Nenhum registro encontrado para os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;