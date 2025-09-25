import React, { useState, useMemo } from 'react';
import { TimeOffRequest, RequestStatus, User, TimeOffType } from '../../types';
import ConfirmationDialog from '../shared/ConfirmationDialog';

interface ManageTimeOffProps {
  requests: TimeOffRequest[];
  employees: User[];
  // FIX: Update status parameter to use RequestStatus enum for type safety.
  onUpdateStatus: (id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO) => void;
}

const getStatusColor = (status: RequestStatus) => {
    switch (status) {
        case RequestStatus.APROVADO: return 'bg-green-100 text-green-800';
        case RequestStatus.NEGADO: return 'bg-red-100 text-red-800';
        case RequestStatus.PENDENTE: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const ManageTimeOff: React.FC<ManageTimeOffProps> = ({ requests, employees, onUpdateStatus }) => {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'TODOS'>('TODOS');
  const [employeeFilter, setEmployeeFilter] = useState<string>('ALL');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const handleDenyClick = (id: string) => {
    setSelectedRequestId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDeny = () => {
    if (selectedRequestId) {
      onUpdateStatus(selectedRequestId, RequestStatus.NEGADO);
    }
    setIsConfirmOpen(false);
    setSelectedRequestId(null);
  };

  const handleCancelDeny = () => {
    setIsConfirmOpen(false);
    setSelectedRequestId(null);
  };

  const filteredRequests = useMemo(() => {
    let filtered = requests;

    if (statusFilter !== 'TODOS') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (employeeFilter !== 'ALL') {
      filtered = filtered.filter(req => req.userId === Number(employeeFilter));
    }

    return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [requests, statusFilter, employeeFilter]);

  return (
    <>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Gerenciar Solicitações de Folga</h2>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <select
              value={employeeFilter}
              onChange={e => setEmployeeFilter(e.target.value)}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base bg-white text-slate-800 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
            >
              <option value="ALL">Todos os Funcionários</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as RequestStatus | 'TODOS')}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base bg-white text-slate-800 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
            >
              <option value="TODOS">Todos os Status</option>
              <option value={RequestStatus.PENDENTE}>{RequestStatus.PENDENTE}</option>
              <option value={RequestStatus.APROVADO}>{RequestStatus.APROVADO}</option>
              <option value={RequestStatus.NEGADO}>{RequestStatus.NEGADO}</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Funcionário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Período</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Anexo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredRequests.map(req => (
                <tr key={req.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{req.userName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{req.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(req.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} - {new Date(req.endDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {req.type === TimeOffType.LICENCA_MEDICA && req.medicalCertificateUrl && (
                      <a 
                        href={req.medicalCertificateUrl}
                        title="Baixar atestado"
                        onClick={(e) => { e.preventDefault(); alert(`Simulando download de ${req.medicalCertificateUrl}`); }}
                        className="text-slate-500 hover:text-slate-800"
                      >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                          {req.status}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {req.status === RequestStatus.PENDENTE && (
                      <div className="space-x-2">
                        <button onClick={() => onUpdateStatus(req.id, RequestStatus.APROVADO)} className="text-green-600 hover:text-green-900">Aprovar</button>
                        <button onClick={() => handleDenyClick(req.id)} className="text-red-600 hover:text-red-900">Negar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRequests.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                  Nenhuma solicitação encontrada para este filtro.
              </div>
          )}
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        title="Negar Solicitação"
        message="Tem certeza de que deseja negar esta solicitação? Esta ação não pode ser revertida."
        onConfirm={handleConfirmDeny}
        onCancel={handleCancelDeny}
        confirmText="Sim, Negar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default ManageTimeOff;