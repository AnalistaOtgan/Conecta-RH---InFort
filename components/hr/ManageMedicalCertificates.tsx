import React, { useState, useMemo } from 'react';
import { MedicalCertificate, RequestStatus, User } from '../../types';
import ConfirmationDialog from '../shared/ConfirmationDialog';

interface AttachmentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachmentUrl: string | null;
}

const AttachmentViewerModal: React.FC<AttachmentViewerModalProps> = ({ isOpen, onClose, attachmentUrl }) => {
  if (!isOpen || !attachmentUrl) return null;

  const isPdf = attachmentUrl.toLowerCase().endsWith('.pdf');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Visualizador de Anexo</h3>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center bg-slate-100 overflow-hidden">
             <div className="text-center p-8 bg-white rounded-lg border border-dashed border-slate-300">
                <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                 <p className="mt-4 font-semibold text-slate-700">Simulação de Visualização</p>
                 <p className="text-sm text-slate-500 mt-1">
                     Em um ambiente de produção, o {isPdf ? 'PDF' : 'arquivo'} seria exibido aqui.
                 </p>
                 <p className="mt-2 text-xs text-slate-400 break-all">Caminho do arquivo: {attachmentUrl}</p>
             </div>
        </div>
      </div>
    </div>
  );
};


interface ManageMedicalCertificatesProps {
  certificates: MedicalCertificate[];
  employees: User[];
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

const ManageMedicalCertificates: React.FC<ManageMedicalCertificatesProps> = ({ certificates, employees, onUpdateStatus }) => {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'TODOS'>('TODOS');
  const [employeeFilter, setEmployeeFilter] = useState<string>('ALL');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [viewingAttachmentUrl, setViewingAttachmentUrl] = useState<string | null>(null);

  const handleViewAttachment = (url: string) => {
    setViewingAttachmentUrl(url);
    setIsAttachmentModalOpen(true);
  };

  const handleCloseAttachmentModal = () => {
    setIsAttachmentModalOpen(false);
    setViewingAttachmentUrl(null);
  };

  const handleDenyClick = (id: string) => {
    setSelectedCertId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDeny = () => {
    if (selectedCertId) {
      onUpdateStatus(selectedCertId, RequestStatus.NEGADO);
    }
    setIsConfirmOpen(false);
    setSelectedCertId(null);
  };

  const handleCancelDeny = () => {
    setIsConfirmOpen(false);
    setSelectedCertId(null);
  };

  const filteredCertificates = useMemo(() => {
    let filtered = certificates;

    if (statusFilter !== 'TODOS') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }

    if (employeeFilter !== 'ALL') {
      filtered = filtered.filter(cert => cert.userId === Number(employeeFilter));
    }

    return filtered.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [certificates, statusFilter, employeeFilter]);

  return (
    <>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Gerenciar Atestados Médicos</h2>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data do Afastamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dias</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Anexo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredCertificates.map(cert => (
                <tr key={cert.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{cert.userName}</div>
                      <div className="text-xs text-slate-500">Enviado em: {new Date(cert.submissionDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(cert.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{cert.days}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewAttachment(cert.fileUrl)}
                      title="Visualizar atestado"
                      className="inline-block text-slate-500 hover:text-slate-800"
                    >
                       <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(cert.status)}`}>
                          {cert.status}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {cert.status === RequestStatus.PENDENTE && (
                      <div className="space-x-2">
                        <button onClick={() => onUpdateStatus(cert.id, RequestStatus.APROVADO)} className="text-green-600 hover:text-green-900">Aprovar</button>
                        <button onClick={() => handleDenyClick(cert.id)} className="text-red-600 hover:text-red-900">Negar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCertificates.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                  Nenhum atestado encontrado para este filtro.
              </div>
          )}
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        title="Negar Atestado"
        message="Tem certeza de que deseja negar este atestado? Esta ação não pode ser revertida."
        onConfirm={handleConfirmDeny}
        onCancel={handleCancelDeny}
        confirmText="Sim, Negar"
        cancelText="Cancelar"
      />
       <AttachmentViewerModal
        isOpen={isAttachmentModalOpen}
        onClose={handleCloseAttachmentModal}
        attachmentUrl={viewingAttachmentUrl}
      />
    </>
  );
};

export default ManageMedicalCertificates;
