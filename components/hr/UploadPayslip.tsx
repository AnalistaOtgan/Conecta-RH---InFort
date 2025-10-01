
import React, { useState, useMemo } from 'react';
import { User, Payslip } from '../../types';

// Declare XLSX, since it's loaded from a script tag and TS doesn't know about it.
declare var XLSX: any;

interface UploadPayslipProps {
  employees: User[];
  users: User[];
  payslips: Payslip[];
  onAddSingle: (payslip: Omit<Payslip, 'id' | 'fileUrl'>) => void;
  onAddBatch: (payslips: Omit<Payslip, 'id' | 'fileUrl'>[]) => Promise<{ successCount: number }>;
}

type ParsedFileStatus = 'ready' | 'error' | 'duplicate';

interface ParsedFileData {
  file: File;
  status: ParsedFileStatus;
  user?: User;
  month?: number;
  year?: number;
  errorMessage?: string;
}

const UploadPayslip: React.FC<UploadPayslipProps> = ({ employees, users, payslips, onAddSingle, onAddBatch }) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'batch'>('individual');

  // State for Individual Upload
  const [userId, setUserId] = useState<number | ''>('');
  const [month, setMonth] = useState<number | ''>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [file, setFile] = useState<File | null>(null);
  const [individualError, setIndividualError] = useState('');

  // State for Batch Upload
  const [parsedFiles, setParsedFiles] = useState<ParsedFileData[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number } | null>(null);

  // --- LOGIC FOR INDIVIDUAL UPLOAD ---
  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !month || !year || !file) {
      setIndividualError('Todos os campos são obrigatórios.');
      return;
    }
    setIndividualError('');
    onAddSingle({ userId: Number(userId), month: Number(month), year });
    setUserId('');
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setFile(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  };

  // --- LOGIC FOR BATCH UPLOAD ---
  const usersByMatricula = useMemo(() => new Map(users.map(u => [u.matricula, u])), [users]);
  const existingPayslipsSet = useMemo(() => new Set(payslips.map(p => `${p.userId}-${p.month}-${p.year}`)), [payslips]);

  const parseAndValidateFiles = (files: FileList) => {
    const newParsedFiles: ParsedFileData[] = [];
    const filenameRegex = /^(\d{8})-(\d{2})-(\d{4})\.pdf$/i;

    for (const file of Array.from(files)) {
      const match = file.name.match(filenameRegex);
      if (!match) {
        newParsedFiles.push({ file, status: 'error', errorMessage: 'Nome de arquivo inválido.' });
        continue;
      }

      const [, matricula, monthStr, yearStr] = match;
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);
      const user = usersByMatricula.get(matricula);

      if (!user) {
        newParsedFiles.push({ file, status: 'error', errorMessage: 'Matrícula não encontrada.' });
        continue;
      }
      
      if (month < 1 || month > 12 || year < 2000 || year > new Date().getFullYear() + 1) {
          newParsedFiles.push({ file, user, month, year, status: 'error', errorMessage: 'Data inválida.' });
          continue;
      }
      
      if (existingPayslipsSet.has(`${user.id}-${month}-${year}`)) {
          newParsedFiles.push({ file, user, month, year, status: 'duplicate', errorMessage: 'Contracheque já existe.' });
          continue;
      }

      newParsedFiles.push({ file, status: 'ready', user, month, year });
    }
    setParsedFiles(newParsedFiles);
    setImportResult(null);
  };

  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      parseAndValidateFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      parseAndValidateFiles(e.dataTransfer.files);
    }
  };

  const handleImportClick = async () => {
    const validPayslipsToImport = parsedFiles
      .filter(pf => pf.status === 'ready')
      .map(pf => ({
        userId: pf.user!.id,
        month: pf.month!,
        year: pf.year!,
      }));
      
    if (validPayslipsToImport.length === 0) return;

    setIsProcessing(true);
    const result = await onAddBatch(validPayslipsToImport);
    setImportResult(result);
    setIsProcessing(false);
    setParsedFiles([]);
  };
  
  const filesReady = parsedFiles.filter(f => f.status === 'ready').length;
  const filesError = parsedFiles.filter(f => f.status === 'error').length;
  const filesDuplicate = parsedFiles.filter(f => f.status === 'duplicate').length;
  
  const tabClasses = (tabName: 'individual' | 'batch') =>
    `px-3 py-4 font-medium text-sm rounded-t-lg transition-colors duration-200 ${
      activeTab === tabName
        ? 'border-b-2 border-slate-800 text-slate-800'
        : 'text-slate-500 hover:text-slate-700 hover:border-slate-300 border-b-2 border-transparent'
    }`;


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Lançar Contracheques</h2>
        
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button className={tabClasses('individual')} onClick={() => setActiveTab('individual')}>
              Lançamento Individual
            </button>
            <button className={tabClasses('batch')} onClick={() => setActiveTab('batch')}>
              Lançamento em Lote
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === 'individual' && (
            <form onSubmit={handleIndividualSubmit} className="space-y-6">
              <div>
                <label htmlFor="employee" className="block text-sm font-medium text-slate-700">Funcionário</label>
                <select
                  id="employee"
                  value={userId}
                  onChange={(e) => setUserId(Number(e.target.value))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-slate-800 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="" disabled>Selecione um funcionário</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="month" className="block text-sm font-medium text-slate-700">Mês de Referência</label>
                  <input
                    type="number"
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                    min="1" max="12"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-slate-700">Ano de Referência</label>
                  <input
                    type="number"
                    id="year"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                    min="2000"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Arquivo do Contracheque</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                  <div className="space-y-2 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex justify-center text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-slate-600 hover:text-slate-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-slate-500">
                        <span>Carregar um arquivo</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} accept="application/pdf" required/>
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    {file ? (
                      <p className="text-sm font-medium text-green-600">Arquivo selecionado: {file.name}</p>
                    ) : (
                      <div className="text-xs text-gray-500">
                          <span className="font-semibold text-gray-600">Tipo:</span> PDF
                          <span className="mx-2">|</span>
                          <span className="font-semibold text-gray-600">Tamanho Máx:</span> 10MB
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {individualError && <p className="text-sm text-red-600">{individualError}</p>}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                  Lançar
                </button>
              </div>
            </form>
          )}

          {activeTab === 'batch' && (
            <div className="space-y-6">
                <div className="p-4 border border-dashed border-slate-300 rounded-md bg-slate-50">
                    <h4 className="font-semibold text-slate-700">Instruções</h4>
                    <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1">
                        <li>Arraste e solte os arquivos PDF ou clique para selecionar.</li>
                        <li>O nome de cada arquivo deve seguir o padrão: <code className="bg-slate-200 px-1 rounded">[MATRICULA]-[MM]-[AAAA].pdf</code>.</li>
                        <li>Exemplo: <code className="bg-slate-200 px-1 rounded">00001001-05-2024.pdf</code>.</li>
                        <li>A matrícula deve conter 8 dígitos.</li>
                    </ul>
                </div>
                
                <div 
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                    className={`flex justify-center px-6 pt-5 pb-6 border-2 ${dragOver ? 'border-slate-500' : 'border-slate-300'} border-dashed rounded-md`}
                >
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 15l-3-3m0 0l3-3m-3 3h12" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="batch-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-slate-600 hover:text-slate-500 focus-within:outline-none">
                                <span>Clique para carregar</span>
                                <input id="batch-file-upload" type="file" className="sr-only" multiple accept=".pdf" onChange={handleBatchFileChange} />
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                        </div>
                        <p className="text-xs text-gray-500">Apenas arquivos PDF</p>
                    </div>
                </div>
                 {importResult && (
                    <div className="p-4 bg-green-50 text-green-800 rounded-md text-center">
                        <p className="font-semibold">{importResult.successCount} contracheque(s) importado(s) com sucesso!</p>
                    </div>
                )}
            </div>
          )}
        </div>
      </div>

      {activeTab === 'batch' && parsedFiles.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Pré-visualização da Importação</h3>
            <div className="flex gap-4 mb-4 text-sm">
                <span className="font-semibold text-green-600">{filesReady} pronto(s) para importar</span>
                <span className="font-semibold text-yellow-600">{filesDuplicate} duplicado(s)</span>
                <span className="font-semibold text-red-600">{filesError} com erro(s)</span>
            </div>
            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Arquivo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Funcionário</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mês/Ano</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {parsedFiles.map((pf, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 truncate max-w-xs">{pf.file.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{pf.user?.name || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{pf.month && pf.year ? `${String(pf.month).padStart(2, '0')}/${pf.year}` : '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {pf.status === 'ready' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Pronto</span>}
                                    {pf.status === 'duplicate' && <span title={pf.errorMessage} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 cursor-help">Duplicado</span>}
                                    {pf.status === 'error' && <span title={pf.errorMessage} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 cursor-help">Erro</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleImportClick}
                    disabled={filesReady === 0 || isProcessing}
                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Importando...' : `Importar ${filesReady} Contracheque(s)`}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default UploadPayslip;
