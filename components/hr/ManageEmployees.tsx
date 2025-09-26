import React, { useState, useMemo } from 'react';
import { User, Role } from '../../types';
import ConfirmationDialog from '../shared/ConfirmationDialog';

// Declare XLSX, since it's loaded from a script tag and TS doesn't know about it.
declare var XLSX: any;

interface ImportResult {
  successCount: number;
  errors: { row: number; data: any; reason:string }[];
}

// ==========================================================
// Inlined ImportEmployeesModal component
// ==========================================================
interface ImportEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => ImportResult;
}

const ImportEmployeesModal: React.FC<ImportEmployeesModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const resetState = () => {
    setFile(null);
    setIsProcessing(false);
    setResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
        if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv') || selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx')) {
            setFile(selectedFile);
            setResult(null);
        } else {
            alert('Por favor, selecione um arquivo CSV ou XLSX.');
        }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleProcessImport = () => {
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        // Filter out empty rows that might be parsed
        const filteredJson = json.filter((row: any) => Object.values(row).some(val => val !== null && val !== ''));

        const importResult = onImport(filteredJson);
        setResult(importResult);
      } catch (error) {
          console.error("Error parsing file:", error);
          setResult({ successCount: 0, errors: [{ row: 0, data: {}, reason: "Erro ao ler o arquivo. Verifique se o formato está correto."}] });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  const downloadTemplate = () => {
      const csvContent = "data:text/csv;charset=utf-8,Nome Completo,Email,Telefone de Emergencia\nExemplo Nome,exemplo@email.com,11999998888";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "template_importacao.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  const downloadErrorDetails = () => {
    if (!result || result.errors.length === 0) return;

    const headers = ["Linha no Arquivo", "Nome Completo", "Email", "Telefone de Emergencia", "Motivo do Erro"];
    const csvRows = [headers.join(',')];

    result.errors.forEach(err => {
        const toCsvField = (value: any) => {
            const str = String(value || '').replace(/"/g, '""');
            return `"${str}"`;
        };

        const rowData = [
            err.row,
            toCsvField(err.data['Nome Completo']),
            toCsvField(err.data['Email']),
            toCsvField(err.data['Telefone de Emergencia']),
            toCsvField(err.reason)
        ];
        csvRows.push(rowData.join(','));
    });
    
    const bom = '\uFEFF';
    const csvContent = bom + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "relatorio_erros_importacao.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 transition-opacity" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Importar Funcionários</h3>
            <button onClick={handleClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="p-6">
            {!result ? (
                <div className="space-y-4">
                    <div className="p-4 border border-dashed border-slate-300 rounded-md bg-slate-50">
                        <h4 className="font-semibold text-slate-700">Instruções</h4>
                        <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1">
                            <li>O arquivo deve ser no formato <code className="bg-slate-200 px-1 rounded">.csv</code> ou <code className="bg-slate-200 px-1 rounded">.xlsx</code>.</li>
                            <li>As colunas devem ser: <code className="bg-slate-200 px-1 rounded">Nome Completo</code>, <code className="bg-slate-200 px-1 rounded">Email</code>, <code className="bg-slate-200 px-1 rounded">Telefone de Emergencia</code>.</li>
                            <li>A primeira linha do arquivo deve conter os nomes das colunas (cabeçalho).</li>
                        </ul>
                        <button onClick={downloadTemplate} className="text-sm mt-3 text-slate-600 hover:text-slate-900 font-medium">Baixar modelo</button>
                    </div>
                     <div 
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${dragOver ? 'border-slate-500' : 'border-slate-300'} border-dashed rounded-md`}>
                        <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 15l-3-3m0 0l3-3m-3 3h12" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-slate-600 hover:text-slate-500 focus-within:outline-none">
                            <span>Carregar um arquivo</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                        </div>
                         {file ? (
                            <p className="text-sm font-medium text-green-600">Arquivo selecionado: {file.name}</p>
                            ) : (
                            <p className="text-xs text-gray-500">CSV ou XLSX até 10MB</p>
                         )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-800">Resultado da Importação</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-md text-center">
                            <p className="text-2xl font-bold text-green-700">{result.successCount}</p>
                            <p className="text-sm font-medium text-green-600">Importados com Sucesso</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-md text-center">
                            <p className="text-2xl font-bold text-red-700">{result.errors.length}</p>
                             <p className="text-sm font-medium text-red-600">Linhas com Erros</p>
                        </div>
                    </div>
                    {result.errors.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h5 className="font-semibold text-slate-700">Detalhes dos Erros:</h5>
                                <button onClick={downloadErrorDetails} className="text-sm text-slate-600 hover:text-slate-900 font-medium inline-flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Baixar Relatório
                                </button>
                            </div>
                            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-md">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left font-medium">Linha</th>
                                            <th className="p-2 text-left font-medium">Email</th>
                                            <th className="p-2 text-left font-medium">Motivo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {result.errors.map((err, i) => (
                                            <tr key={i}>
                                                <td className="p-2">{err.row}</td>
                                                <td className="p-2 truncate">{err.data?.Email || 'N/A'}</td>
                                                <td className="p-2">{err.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            {!result ? (
                <>
                    <button type="button" onClick={handleClose} className="px-4 py-2 bg-white text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                    <button type="button" onClick={handleProcessImport} disabled={!file || isProcessing} className="px-4 py-2 bg-slate-800 text-sm font-medium text-white border border-transparent rounded-md hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed">
                        {isProcessing ? 'Processando...' : 'Processar Importação'}
                    </button>
                </>
            ) : (
                <button type="button" onClick={handleClose} className="px-4 py-2 bg-slate-800 text-sm font-medium text-white border border-transparent rounded-md hover:bg-slate-900">
                    Concluir
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
// ==========================================================
// Inlined RegisterEmployeeModal component
// ==========================================================
interface RegisterEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, email: string, emergencyPhone?: string) => void;
  users: User[];
}

const RegisterEmployeeModal: React.FC<RegisterEmployeeModalProps> = ({ isOpen, onClose, onSubmit, users }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [error, setError] = useState('');

  const resetStateAndClose = () => {
    setName('');
    setEmail('');
    setEmergencyPhone('');
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError('Este email já está em uso.');
        return;
    }
    setError('');
    onSubmit(name, email, emergencyPhone);
    resetStateAndClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 transition-opacity" onClick={resetStateAndClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Cadastrar Novo Funcionário</h3>
            <button onClick={resetStateAndClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome Completo</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emergencyPhone" className="block text-sm font-medium text-slate-700">Telefone de Contato (Opcional)</label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="(XX) XXXXX-XXXX"
                    className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                <button type="button" onClick={resetStateAndClose} className="px-4 py-2 bg-white text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-slate-800 text-sm font-medium text-white border border-transparent rounded-md hover:bg-slate-900">
                  Cadastrar
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
// ==========================================================

interface ManageEmployeesProps {
  users: User[];
  onUpdateStatus: (userId: number, status: 'ATIVO' | 'INATIVO') => void;
  onResetPassword: (userId: number) => void;
  onImport: (data: any[]) => ImportResult;
  onRegister: (name: string, email: string, emergencyPhone?: string) => void;
}

const getStatusColor = (status: 'ATIVO' | 'INATIVO') => {
    return status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800';
};

const ManageEmployees: React.FC<ManageEmployeesProps> = ({ users, onUpdateStatus, onResetPassword, onImport, onRegister }) => {
  const [filter, setFilter] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<(() => void) | null>(null);
  const [confirmationDetails, setConfirmationDetails] = useState({ title: '', message: '', confirmText: '' });

  const handleStatusUpdateClick = (userId: number, currentStatus: 'ATIVO' | 'INATIVO') => {
    const newStatus = currentStatus === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    setConfirmationDetails({
        title: `${newStatus === 'ATIVO' ? 'Reativar' : 'Desativar'} Funcionário`,
        message: `Tem certeza que deseja ${newStatus === 'ATIVO' ? 'reativar' : 'desativar'} este funcionário?`,
        confirmText: `Sim, ${newStatus === 'ATIVO' ? 'Reativar' : 'Desativar'}`
    });
    setConfirmationAction(() => () => onUpdateStatus(userId, newStatus));
    setIsConfirmOpen(true);
  };

  const handleResetPasswordClick = (userId: number) => {
    setConfirmationDetails({
        title: 'Resetar Senha',
        message: 'Tem certeza que deseja resetar a senha deste funcionário? O usuário precisará criar uma nova senha no próximo login.',
        confirmText: 'Sim, Resetar'
    });
    setConfirmationAction(() => () => onResetPassword(userId));
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (confirmationAction) {
      confirmationAction();
    }
    handleCancel();
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
    setConfirmationAction(null);
  };

  const filteredUsers = useMemo(() => {
    const employees = users.filter(u => u.role === Role.FUNCIONARIO);
    if (!filter) {
      return employees;
    }
    const lowercasedFilter = filter.toLowerCase();
    const numericFilter = filter.replace(/\D/g, '');

    return employees.filter(
      user =>
        user.name.toLowerCase().includes(lowercasedFilter) ||
        user.email.toLowerCase().includes(lowercasedFilter) ||
        (user.emergencyPhone && user.emergencyPhone.replace(/\D/g, '').includes(numericFilter))
    );
  }, [users, filter]);

  return (
    <>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Gerenciar Funcionários</h2>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Filtrar por nome, email ou telefone..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="block w-full sm:w-64 pl-3 pr-10 py-2 text-base bg-white text-slate-800 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
            />
             <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Importar
            </button>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Novo Funcionário
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Telefone de Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.emergencyPhone || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleResetPasswordClick(user.id)} className="text-slate-600 hover:text-slate-900 transition-colors">Resetar Senha</button>
                    <button
                      onClick={() => handleStatusUpdateClick(user.id, user.status)}
                      className={`${user.status === 'ATIVO' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} transition-colors`}
                    >
                      {user.status === 'ATIVO' ? 'Desativar' : 'Reativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              Nenhum funcionário encontrado.
            </div>
          )}
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        title={confirmationDetails.title}
        message={confirmationDetails.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText={confirmationDetails.confirmText}
        cancelText="Cancelar"
      />
       <ImportEmployeesModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={onImport}
      />
       <RegisterEmployeeModal 
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={onRegister}
        users={users}
      />
    </>
  );
};

export default ManageEmployees;