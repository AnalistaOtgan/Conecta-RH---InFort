import React, { useState } from 'react';
import { MedicalCertificate } from '../../types';

interface SubmitMedicalCertificateProps {
  onSubmit: (request: Omit<MedicalCertificate, 'id' | 'status' | 'userName' | 'userId' | 'submissionDate' | 'fileUrl'>) => void;
}

const SubmitMedicalCertificate: React.FC<SubmitMedicalCertificateProps> = ({ onSubmit }) => {
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState<number | ''>('');
  const [cidCode, setCidCode] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !days || !certificateFile) {
      setError('Data de início, quantidade de dias e o anexo do atestado são obrigatórios.');
      return;
    }
    if (days <= 0) {
      setError('A quantidade de dias deve ser maior que zero.');
      return;
    }
    setError('');

    const requestData: Omit<MedicalCertificate, 'id' | 'status' | 'userName' | 'userId' | 'submissionDate' | 'fileUrl'> = {
        startDate,
        days: Number(days),
        cidCode: cidCode || undefined
    };

    onSubmit(requestData);
    
    // Reset form
    setStartDate('');
    setDays('');
    setCidCode('');
    setCertificateFile(null);
    const fileInput = document.getElementById('certificate-file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Enviar Atestado Médico</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Data de Início do Afastamento</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
              required
            />
          </div>
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-slate-700">Quantidade de Dias</label>
            <input
              type="number"
              id="days"
              value={days}
              min="1"
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="cidCode" className="block text-sm font-medium text-slate-700">Código CID (Opcional)</label>
          <input
            type="text"
            id="cidCode"
            value={cidCode}
            onChange={(e) => setCidCode(e.target.value.toUpperCase())}
            placeholder="Ex: J06.9"
            className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700">Arquivo do Atestado</label>
            <div className="mt-1 flex items-center space-x-4">
                <label htmlFor="certificate-file-upload" className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                    <span>Selecionar arquivo</span>
                    <input id="certificate-file-upload" name="certificate-file-upload" type="file" className="sr-only" onChange={(e) => setCertificateFile(e.target.files ? e.target.files[0] : null)} accept="application/pdf,image/jpeg,image/png" required />
                </label>
                {certificateFile && (
                    <p className="text-sm text-slate-600 truncate">{certificateFile.name}</p>
                )}
            </div>
            {!certificateFile && <p className="text-xs text-slate-500 mt-1">Anexo obrigatório. Formatos: PDF, JPG, PNG.</p>}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
          >
            Enviar Atestado
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitMedicalCertificate;
