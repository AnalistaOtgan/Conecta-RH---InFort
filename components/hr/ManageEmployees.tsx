

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Role, ImportResult } from '../../types';
import ConfirmationDialog from '../shared/ConfirmationDialog';

// Declare XLSX, since it's loaded from a script tag and TS doesn't know about it.
declare var XLSX: any;

// ==========================================================
// Inlined ImportEmployeesModal component
// ==========================================================
interface ImportEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<ImportResult>;
  users: User[];
  onUpdateStatus: (userId: number, status: 'ATIVO' | 'INATIVO') => void;
}

const ImportEmployeesModal: React.FC<ImportEmployeesModalProps> = ({ isOpen, onClose, onImport, users, onUpdateStatus }) => {
  const [step, setStep] = useState<'upload' | 'conflict' | 'result'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const [errorRows, setErrorRows] = useState<{ row: number; data: any; reason: string }[]>([]);
  const [validRows, setValidRows] = useState<any[]>([]);
  const [conflictRows, setConflictRows] = useState<{ rowData: any; rowIndex: number; existingUser: User; resolve: boolean }[]>([]);
  const [finalResult, setFinalResult] = useState<{ imported: number; deactivated: number; errors: number; skipped: number} | null>(null);


  const resetState = () => {
    setStep('upload');
    setFile(null);
    setIsProcessing(false);
    setErrorRows([]);
    setValidRows([]);
    setConflictRows([]);
    setFinalResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
        if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv') || selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheet.sheet' || selectedFile.name.endsWith('.xlsx')) {
            setFile(selectedFile);
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

  const parseAndPreprocessFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        const parsedData = json.filter((row: any) => Object.values(row).some(val => val !== null && val !== ''));
        
        // --- Pre-validation Logic ---
        const localValidRows: any[] = [];
        const localErrorRows: { row: number; data: any; reason: string }[] = [];
        const localConflictRows: { rowData: any; rowIndex: number; existingUser: User; resolve: boolean }[] = [];

        const activeUsers = users.filter(u => u.status === 'ATIVO');
        const activeEmails = new Map(activeUsers.map(u => [u.email.toLowerCase(), u]));
        const activeMatriculas = new Map(activeUsers.map(u => [u.matricula, u]));
        
        const fileEmails = new Set<string>();
        const fileMatriculas = new Set<string>();

        parsedData.forEach((row: any, index: number) => {
            const rowIndex = index + 2;
            const { 'Nome Completo': name, Email: email, 'Matrícula': matricula } = row;

            if (!name || !email) {
                localErrorRows.push({ row: rowIndex, data: row, reason: 'Nome Completo e Email são obrigatórios.' });
                return;
            }
            if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
                localErrorRows.push({ row: rowIndex, data: row, reason: 'Formato de email inválido.' });
                return;
            }
            
            const lowercasedEmail = email.toLowerCase();
            if (fileEmails.has(lowercasedEmail)) {
                localErrorRows.push({ row: rowIndex, data: row, reason: 'Email duplicado dentro do arquivo.' });
                return;
            }
            fileEmails.add(lowercasedEmail);
            
            if (matricula) {
                if(fileMatriculas.has(String(matricula))) {
                    localErrorRows.push({ row: rowIndex, data: row, reason: 'Matrícula duplicada dentro do arquivo.' });
                    return;
                }
                fileMatriculas.add(String(matricula));
            }

            const conflictByEmail = activeEmails.get(lowercasedEmail);
            const conflictByMatricula = matricula ? activeMatriculas.get(String(matricula)) : undefined;
            const existingUser = conflictByMatricula || conflictByEmail;

            if (existingUser) {
                localConflictRows.push({ rowData: row, rowIndex, existingUser, resolve: true });
            } else {
                localValidRows.push(row);
            }
        });

        setValidRows(localValidRows);
        setErrorRows(localErrorRows);
        setConflictRows(localConflictRows);

        if (localConflictRows.length > 0) {
            setStep('conflict');
        } else if (localValidRows.length > 0 || localErrorRows.length > 0) {
            // FIX: Pass the correctly typed (but empty) `localConflictRows` array to avoid type inference issues with a new empty array.
            await handleFinalImport(localValidRows, localConflictRows);
        } else {
            setFinalResult({ imported: 0, deactivated: 0, errors: 0, skipped: 0 });
            setStep('result');
        }

      } catch (error) {
          console.error("Error parsing file:", error);
          setErrorRows([{ row: 0, data: { 'Nome Completo': 'N/A', Email: 'N/A', 'Matrícula': 'N/A' }, reason: "Erro ao ler o arquivo. Verifique se o formato está correto."}]);
          setStep('result');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  const handleFinalImport = async (
    rowsToImport: any[], 
    conflictsToResolve: { rowData: any; rowIndex: number; existingUser: User; resolve: boolean }[]
  ) => {
    setIsProcessing(true);
    let deactivatedCount = 0;
    let skippedCount = 0;
    const finalRowsToImport = [...rowsToImport];

    for (const conflict of conflictsToResolve) {
        if (conflict.resolve) {
            try {
                await onUpdateStatus(conflict.existingUser.id, 'INATIVO');
                finalRowsToImport.push(conflict.rowData);
                deactivatedCount++;
            } catch (e) {
                console.error(`Failed to deactivate user ${conflict.existingUser.name}`, e);
                errorRows.push({ row: conflict.rowIndex, data: conflict.rowData, reason: `Falha ao desativar usuário existente: ${conflict.existingUser.name}`});
            }
        } else {
            skippedCount++;
        }
    }
    
    let importResult: ImportResult = { successCount: 0, errors: [] };
    if (finalRowsToImport.length > 0) {
        importResult = await onImport(finalRowsToImport);
    }
    
    setFinalResult({
        imported: importResult.successCount,
        deactivated: deactivatedCount,
        errors: errorRows.length + importResult.errors.length,
        skipped: skippedCount
    });

    setStep('result');
    setIsProcessing(false);
  };

  const handleConflictResolveChange = (index: number) => {
    const updatedConflicts = [...conflictRows];
    updatedConflicts[index].resolve = !updatedConflicts[index].resolve;
    setConflictRows(updatedConflicts);
  }

  const downloadTemplate = () => {
      const csvContent = "data:text/csv;charset=utf-8,Nome Completo,Email,Matrícula,Data de Nascimento,Telefone de Emergencia\nExemplo Nome,exemplo@email.com,001001,1990-12-31,11999998888";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "template_importacao.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const renderUploadStep = () => (
     <>
        <div className="space-y-4">
            <div className="p-4 border border-dashed border-slate-300 rounded-md bg-slate-50">
                <h4 className="font-semibold text-slate-700">Instruções</h4>
                <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1">
                    <li>O arquivo deve ser no formato <code className="bg-slate-200 px-1 rounded">.csv</code> ou <code className="bg-slate-200 px-1 rounded">.xlsx</code>.</li>
                    <li>As colunas devem ser: <code className="bg-slate-200 px-1 rounded">Nome Completo</code>, <code className="bg-slate-200 px-1 rounded">Email</code>, <code className="bg-slate-200 px-1 rounded">Matrícula</code> (6 dígitos), <code className="bg-slate-200 px-1 rounded">Data de Nascimento</code> (opcional, ex: AAAA-MM-DD), <code className="bg-slate-200 px-1 rounded">Telefone de Emergencia</code> (opcional).</li>
                    <li>Se a matrícula não for fornecida, uma será gerada automaticamente.</li>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 15l-3-3m0 0l3-3m-3 3h12" />
                </svg>
                <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-slate-600 hover:text-slate-500 focus-within:outline-none">
                    <span>Carregar um arquivo</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheet.sheet, application/vnd.ms-excel" />
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
         <div className="bg-gray-50 mt-6 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-white text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={parseAndPreprocessFile} disabled={!file || isProcessing} className="px-4 py-2 bg-slate-800 text-sm font-medium text-white border border-transparent rounded-md hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed">
                {isProcessing ? 'Processando...' : 'Verificar Arquivo'}
            </button>
        </div>
    </>
  );

  const renderConflictStep = () => (
    <>
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800">Conflitos Encontrados</h4>
            <p className="text-sm text-slate-600">Encontramos {conflictRows.length} linha(s) no seu arquivo que conflitam com usuários ativos existentes. Decida como proceder para cada caso abaixo.</p>
            <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-2 bg-slate-50">
                {conflictRows.map((conflict, index) => (
                    <div key={index} className="bg-white p-4 rounded-md border">
                        <div className="flex items-start">
                            <input
                                id={`conflict-${index}`}
                                type="checkbox"
                                checked={conflict.resolve}
                                onChange={() => handleConflictResolveChange(index)}
                                className="h-4 w-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500 mt-1"
                            />
                            <label htmlFor={`conflict-${index}`} className="ml-3 text-sm flex-1">
                                <span className="font-semibold text-slate-800">Desativar {conflict.existingUser.name}</span>
                                <span className="text-slate-500"> (Mat. {conflict.existingUser.matricula}) e importar os novos dados?</span>
                                <div className="mt-2 text-xs p-2 bg-slate-50 rounded border border-slate-200">
                                    <p><strong>Novos dados:</strong> {conflict.rowData['Nome Completo']} / {conflict.rowData['Email']}</p>
                                </div>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-gray-50 mt-6 px-6 py-4 flex justify-between items-center rounded-b-lg">
            <span className="text-sm text-slate-600">{validRows.length} novo(s) para importar, {errorRows.length} com erro(s).</span>
            <div className="space-x-3">
                <button type="button" onClick={() => setStep('upload')} className="px-4 py-2 bg-white text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50">Voltar</button>
                <button type="button" onClick={() => handleFinalImport(validRows, conflictRows)} disabled={isProcessing} className="px-4 py-2 bg-slate-800 text-sm font-medium text-white border border-transparent rounded-md hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed">
                    {isProcessing ? 'Importando...' : 'Confirmar Importação'}
                </button>
            </div>
        </div>
    </>
  );

  const renderResultStep = () => (
    <>
        <div className="space-y-4 text-center">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-lg font-semibold text-slate-800">Importação Concluída</h4>
            <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-2xl font-bold text-green-700">{finalResult?.imported ?? 0}</p>
                    <p className="text-sm font-medium text-green-600">Importados com Sucesso</p>
                </div>
                 <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-2xl font-bold text-yellow-700">{finalResult?.deactivated ?? 0}</p>
                    <p className="text-sm font-medium text-yellow-600">Usuários Desativados</p>
                </div>
                 <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-2xl font-bold text-red-700">{finalResult?.errors ?? 0}</p>
                     <p className="text-sm font-medium text-red-600">Linhas com Erros</p>
                </div>
                 <div className="bg-slate-50 p-4 rounded-md">
                    <p className="text-2xl font-bold text-slate-700">{finalResult?.skipped ?? 0}</p>
                     <p className="text-sm font-medium text-slate-600">Conflitos Ignorados</p>
                </div>
            </div>
        </div>
        <div className="bg-gray-50 mt-6 px-6 py-4 flex justify-end rounded-b-lg">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-slate-800 text-sm font-medium text-white border border-transparent rounded-md hover:bg-slate-900">
                Concluir
            </button>
        </div>
    </>
  );

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
            {step === 'upload' && renderUploadStep()}
            {step === 'conflict' && renderConflictStep()}
            {step === 'result' && finalResult && renderResultStep()}
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
  onSubmit: (name: string, email: string, matricula: string, emergencyPhone?: string, birthDate?: string) => void;
  users: User[];
}

const RegisterEmployeeModal: React.FC<RegisterEmployeeModalProps> = ({ isOpen, onClose, onSubmit, users }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [error, setError] = useState('');

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setMatricula(value.slice(0, 6));
  };

  const resetStateAndClose = () => {
    setName('');
    setEmail('');
    setMatricula('');
    setBirthDate('');
    setEmergencyPhone('');
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matricula.length !== 6) {
        setError('A matrícula deve conter 6 dígitos.');
        return;
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError('Este email já está em uso.');
        return;
    }
    if (users.some(u => u.matricula === matricula)) {
        setError('Esta matrícula já está em uso.');
        return;
    }
    setError('');
    onSubmit(name, email, matricula, emergencyPhone, birthDate);
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
                  <label htmlFor="matricula" className="block text-sm font-medium text-slate-700">Matrícula</label>
                  <input
                    type="text"
                    id="matricula"
                    value={matricula}
                    onChange={handleMatriculaChange}
                    placeholder="000000"
                    maxLength={6}
                    className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700">Data de Nascimento (Opcional)</label>
                  <input
                    type="date"
                    id="birthDate"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
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
// Inlined EditEmployeeModal component
// ==========================================================
interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: number, data: Partial<Pick<User, 'name' | 'email' | 'emergencyPhone' | 'matricula' | 'birthDate'>>) => void;
  user: User | null;
  allUsers: User[];
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ isOpen, onClose, onSubmit, user, allUsers }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setMatricula(user.matricula);
      setEmergencyPhone(user.emergencyPhone || '');
      setBirthDate(user.birthDate || '');
      setError('');
    }
  }, [user]);

  if (!isOpen || !user) return null;
  
  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setMatricula(value.slice(0, 6));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email.toLowerCase() !== user.email.toLowerCase()) {
      if (allUsers.some(u => u.id !== user.id && u.email.toLowerCase() === email.toLowerCase())) {
        setError('Este email já está em uso por outro usuário.');
        return;
      }
    }

    if (matricula !== user.matricula) {
      if (matricula.length !== 6) {
        setError('A matrícula deve conter 6 dígitos.');
        return;
      }
      if (allUsers.some(u => u.id !== user.id && u.matricula === matricula)) {
        setError('Esta matrícula já está em uso por outro usuário.');
        return;
      }
    }
    
    const updatedData: Partial<Pick<User, 'name' | 'email' | 'emergencyPhone' | 'matricula' | 'birthDate'>> = {};
    if (name !== user.name) updatedData.name = name;
    if (email !== user.email) updatedData.email = email;
    if (matricula !== user.matricula) updatedData.matricula = matricula;
    if (birthDate !== (user.birthDate || '')) updatedData.birthDate = birthDate;
    if (emergencyPhone !== (user.emergencyPhone || '')) updatedData.emergencyPhone = emergencyPhone;

    if (Object.keys(updatedData).length > 0) {
        onSubmit(user.id, updatedData);
    }
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Editar Dados do Funcionário</h3>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700">Nome Completo</label>
                  <input
                    type="text" id="edit-name" value={name} onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                    required
                  />
                </div>
                 <div>
                  <label htmlFor="edit-matricula" className="block text-sm font-medium text-slate-700">Matrícula</label>
                  <input
                    type="text"
                    id="edit-matricula"
                    value={matricula}
                    onChange={handleMatriculaChange}
                    placeholder="000000"
                    maxLength={6}
                    className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                    required
                  />
                </div>
                 <div>
                  <label htmlFor="edit-birthDate" className="block text-sm font-medium text-slate-700">Data de Nascimento</label>
                  <input
                    type="date" id="edit-birthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                    className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email" id="edit-email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-emergencyPhone" className="block text-sm font-medium text-slate-700">Telefone de Contato (Opcional)</label>
                  <input
                    type="tel" id="edit-emergencyPhone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="(XX) XXXXX-XXXX"
                    className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-slate-800 text-sm font-medium text-white border border-transparent rounded-md hover:bg-slate-900">
                  Salvar Alterações
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
// ==========================================================


interface ManageEmployeesProps {
  user: User;
  users: User[];
  onUpdateStatus: (userId: number, status: 'ATIVO' | 'INATIVO') => void;
  onResetPassword: (userId: number) => void;
  onImport: (data: any[]) => Promise<ImportResult>;
  onRegister: (name: string, email: string, matricula: string, emergencyPhone?: string, birthDate?: string) => void;
  onUpdateRole: (userId: number, role: Role) => void;
  onUpdateEmployee: (userId: number, data: Partial<Pick<User, 'name' | 'email' | 'emergencyPhone' | 'matricula' | 'birthDate'>>) => void;
  onDelete: (userId: number) => void;
}

const getStatusColor = (status: 'ATIVO' | 'INATIVO') => {
    return status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800';
};

const ManageEmployees: React.FC<ManageEmployeesProps> = ({ user: currentUser, users, onUpdateStatus, onResetPassword, onImport, onRegister, onUpdateRole, onUpdateEmployee, onDelete }) => {
  const [filter, setFilter] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmationAction, setConfirmationAction] = useState<(() => void) | null>(null);
  const [confirmationDetails, setConfirmationDetails] = useState({ title: '', message: '', confirmText: '' });
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenActionMenu(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: () => void, {title, message, confirmText}: any) => {
    setConfirmationDetails({ title, message, confirmText });
    setConfirmationAction(() => () => action());
    setIsConfirmOpen(true);
    setOpenActionMenu(null);
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

  const handleEditClick = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsEditModalOpen(true);
    setOpenActionMenu(null);
  };

  const filteredUsers = useMemo(() => {
    const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));
    if (!filter) {
      return sortedUsers;
    }
    const lowercasedFilter = filter.toLowerCase();
    return sortedUsers.filter(user =>
        user.name.toLowerCase().includes(lowercasedFilter) ||
        user.email.toLowerCase().includes(lowercasedFilter) ||
        user.role.toLowerCase().includes(lowercasedFilter) ||
        user.matricula.includes(lowercasedFilter)
    );
  }, [users, filter]);

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) return;
    const headers = ["Nome Completo", "Email", "CPF", "Matrícula", "Cargo", "Telefone de Contato", "Status"];
    const escapeCell = (cellData: any) => `"${String(cellData || '').replace(/"/g, '""')}"`;
    const rows = filteredUsers.map(user => [
        escapeCell(user.name), escapeCell(user.email), escapeCell(user.cpf),
        escapeCell(user.matricula), escapeCell(user.role), escapeCell(user.emergencyPhone), escapeCell(user.status)
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "lista_de_funcionarios.csv";
    link.click();
  };

  const canEdit = (targetUser: User) => {
      if (currentUser.id === targetUser.id) return false; // Cannot edit self
      if (currentUser.role === Role.ADMIN) return true; // Admin can edit anyone
      if (currentUser.role === Role.RH && targetUser.role !== Role.ADMIN) return true; // RH can edit non-admins
      return false;
  }

  return (
    <>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Gerenciar Usuários</h2>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Filtrar por nome, email, matrícula..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="block w-full sm:w-64 pl-3 pr-10 py-2 text-base bg-white text-slate-800 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
            />
             <button onClick={handleExportCSV} disabled={filteredUsers.length === 0} className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Exportar</button>
             <button onClick={() => setIsImportModalOpen(true)} className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Importar</button>
            <button onClick={() => setIsRegisterModalOpen(true)} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Novo</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-white rounded-lg shadow-md border border-slate-200 flex flex-col p-4 relative transition-shadow hover:shadow-lg">
                {canEdit(user) && (
                  <div className="absolute top-2 right-2" ref={openActionMenu === user.id ? menuRef : null}>
                    <button onClick={() => setOpenActionMenu(openActionMenu === user.id ? null : user.id)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                    </button>
                    {openActionMenu === user.id && (
                        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu">
                                <button onClick={() => handleEditClick(user)} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Editar Dados</button>
                                <div className="border-t my-1"></div>
                                <div className="px-4 py-2 text-xs text-gray-500 uppercase">Alterar Cargo</div>
                                { (currentUser.role === Role.ADMIN) && (user.role !== Role.ADMIN) && <button onClick={() => handleAction(() => onUpdateRole(user.id, Role.ADMIN), {title: 'Promover a Admin', message:`Promover ${user.name} para Administrador?`, confirmText:'Sim, Promover'})} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Administrador</button>}
                                { (user.role !== Role.RH) && <button onClick={() => handleAction(() => onUpdateRole(user.id, Role.RH), {title: `Promover ${user.role === Role.ADMIN ? 'ou Rebaixar ' : ''}a RH`, message:`Alterar o cargo de ${user.name} para RH?`, confirmText:'Sim, Alterar'})} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">RH</button>}
                                { (user.role !== Role.FUNCIONARIO) && <button onClick={() => handleAction(() => onUpdateRole(user.id, Role.FUNCIONARIO), {title: 'Rebaixar a Funcionário', message:`Rebaixar ${user.name} para Funcionário?`, confirmText:'Sim, Rebaixar'})} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Funcionário</button>}
                                <div className="border-t my-1"></div>
                                <button onClick={() => handleAction(() => onResetPassword(user.id), {title: 'Resetar Senha', message: `Resetar a senha de ${user.name}?`, confirmText: 'Sim, Resetar'})} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Resetar Senha</button>
                                <button onClick={() => handleAction(() => onUpdateStatus(user.id, user.status === 'ATIVO' ? 'INATIVO' : 'ATIVO'), {title: `${user.status === 'ATIVO' ? 'Desativar' : 'Reativar'} Usuário`, message:`${user.status === 'ATIVO' ? 'Desativar' : 'Reativar'} o usuário ${user.name}?`, confirmText:`Sim, ${user.status === 'ATIVO' ? 'Desativar' : 'Reativar'}`})} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{user.status === 'ATIVO' ? 'Desativar' : 'Reativar'}</button>
                                { currentUser.role === Role.ADMIN && 
                                    <button onClick={() => handleAction(() => onDelete(user.id), {title: 'Excluir Usuário', message:`Excluir ${user.name} permanentemente? Esta ação é irreversível.`, confirmText: 'Sim, Excluir'})} className="w-full text-left block px-4 py-2 text-sm text-red-700 hover:bg-red-50">Excluir</button>
                                }
                            </div>
                        </div>
                    )}
                  </div>
                )}
                <div className="flex flex-col items-center text-center flex-grow">
                    <img className="h-20 w-20 rounded-full object-cover mb-3" src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`} alt={user.name} />
                    <h3 className="text-md font-bold text-slate-800">{user.name}</h3>
                    <p className="text-sm text-slate-500 truncate w-full" title={user.email}>{user.email}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 w-full text-sm text-slate-600 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Matrícula:</span>
                        <span>{user.matricula}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Cargo:</span>
                        <span>{user.role}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Nascimento:</span>
                        <span>{user.birthDate ? new Date(user.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="font-semibold">Status:</span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>{user.status}</span>
                    </div>
                </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (<div className="text-center py-16 text-slate-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">Tente ajustar seus filtros de busca.</p>
        </div>)}
      </div>
      <ConfirmationDialog isOpen={isConfirmOpen} title={confirmationDetails.title} message={confirmationDetails.message} onConfirm={handleConfirm} onCancel={handleCancel} confirmText={confirmationDetails.confirmText} />
      <ImportEmployeesModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={onImport}
        users={users}
        onUpdateStatus={onUpdateStatus}
      />
      <RegisterEmployeeModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} onSubmit={onRegister} users={users} />
      <EditEmployeeModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={onUpdateEmployee} user={editingUser} allUsers={users} />
    </>
  );
};

export default ManageEmployees;