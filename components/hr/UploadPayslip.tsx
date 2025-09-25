import React, { useState } from 'react';
import { User, Payslip } from '../../types';

interface UploadPayslipProps {
  employees: User[];
  onSubmit: (payslip: Omit<Payslip, 'id' | 'fileUrl'>) => void;
}

const UploadPayslip: React.FC<UploadPayslipProps> = ({ employees, onSubmit }) => {
  const [userId, setUserId] = useState<number | ''>('');
  const [month, setMonth] = useState<number | ''>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !month || !year || !file) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    setError('');
    onSubmit({ userId: Number(userId), month: Number(month), year });
    setUserId('');
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setFile(null);
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Lançar Contracheque</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
        
        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
          >
            Lançar
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadPayslip;