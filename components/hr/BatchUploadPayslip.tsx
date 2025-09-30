import React, { useState, useMemo } from 'react';
import { User, Payslip } from '../../types';

interface BatchUploadPayslipProps {
  users: User[];
  payslips: Payslip[];
  onImport: (payslips: Omit<Payslip, 'id' | 'fileUrl'>[]) => Promise<{ successCount: number }>;
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

const BatchUploadPayslip: React.FC<BatchUploadPayslipProps> = ({ users, payslips, onImport }) => {
  const [parsedFiles, setParsedFiles] = useState<ParsedFileData[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number } | null>(null);

  const usersByCpf = useMemo(() => new Map(users.map(u => [u.cpf, u])), [users]);
  const existingPayslipsSet = useMemo(() => new Set(payslips.map(p => `${p.userId}-${p.month}-${p.year}`)), [payslips]);

  const parseAndValidateFiles = (files: FileList) => {
    const newParsedFiles: ParsedFileData[] = [];
    const filenameRegex = /^(\d{11})-(\d{2})-(\d{4})\.pdf$/i;

    for (const file of Array.from(files)) {
      const match = file.name.match(filenameRegex);
      if (!match) {
        newParsedFiles.push({ file, status: 'error', errorMessage: 'Nome de arquivo inválido.' });
        continue;
      }

      const [, cpf, monthStr, yearStr] = match;
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);
      const user = usersByCpf.get(cpf);

      if (!user) {
        newParsedFiles.push({ file, status: 'error', errorMessage: 'CPF não encontrado.' });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const result = await onImport(validPayslipsToImport);
    setImportResult(result);
    setIsProcessing(false);
    setParsedFiles([]);
  };
  
  const filesReady = parsedFiles.filter(f => f.status === 'ready').length;
  const filesError = parsedFiles.filter(f => f.status === 'error').length;
  const filesDuplicate = parsedFiles.filter(f => f.status === 'duplicate').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Lançar Contracheques em Lote</h2>
        <p className="text-slate-600 mb-6">Importe múltiplos arquivos PDF de uma só vez.</p>
        
        <div className="p-4 border border-dashed border-slate-300 rounded-md bg-slate-50 mb-6">
            <h4 className="font-semibold text-slate-700">Instruções</h4>
            <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1">
                <li>Arraste e solte os arquivos PDF ou clique para selecionar.</li>
                <li>O nome de cada arquivo deve seguir o padrão: <code className="bg-slate-200 px-1 rounded">[CPF]-[MM]-[AAAA].pdf</code>.</li>
                <li>Exemplo: <code className="bg-slate-200 px-1 rounded">12345678900-05-2024.pdf</code>.</li>
                <li>O CPF deve conter 11 dígitos, sem pontos ou traços.</li>
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
                        <input id="batch-file-upload" type="file" className="sr-only" multiple accept=".pdf" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs text-gray-500">Apenas arquivos PDF</p>
            </div>
        </div>
        {importResult && (
            <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-md text-center">
                <p className="font-semibold">{importResult.successCount} contracheques importados com sucesso!</p>
            </div>
        )}
      </div>

      {parsedFiles.length > 0 && (
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

export default BatchUploadPayslip;
