import React, { useState } from 'react';
import { TimeOffRequest, TimeOffType } from '../../types';

interface RequestTimeOffProps {
  onSubmit: (request: Omit<TimeOffRequest, 'id' | 'status' | 'userName' | 'userId'>) => void;
}

const RequestTimeOff: React.FC<RequestTimeOffProps> = ({ onSubmit }) => {
  const [type, setType] = useState<TimeOffType>(TimeOffType.FERIAS);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [justification, setJustification] = useState('');
  const [medicalCertificate, setMedicalCertificate] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('As datas de início e fim são obrigatórias.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        setError('A data de início não pode ser posterior à data de fim.');
        return;
    }
    setError('');

    const requestData: Omit<TimeOffRequest, 'id' | 'status' | 'userName' | 'userId'> = {
        type,
        startDate,
        endDate,
        justification
    };

    if (type === TimeOffType.LICENCA_MEDICA && medicalCertificate) {
        // Simulate file upload and get a URL
        requestData.medicalCertificateUrl = `/certificates/med-cert-${Date.now()}.pdf`;
    }

    onSubmit(requestData);
    
    // Reset form
    setType(TimeOffType.FERIAS);
    setStartDate('');
    setEndDate('');
    setJustification('');
    setMedicalCertificate(null);
    const fileInput = document.getElementById('medical-certificate-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Solicitar Folga</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-slate-700">Tipo de Folga</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as TimeOffType)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-slate-800 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
          >
            {Object.values(TimeOffType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        
        {type === TimeOffType.LICENCA_MEDICA && (
            <div>
                <label className="block text-sm font-medium text-slate-700">Atestado Médico (Opcional)</label>
                <div className="mt-1 flex items-center space-x-4">
                    <label htmlFor="medical-certificate-upload" className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                        <span>Selecionar arquivo</span>
                        <input id="medical-certificate-upload" name="medical-certificate-upload" type="file" className="sr-only" onChange={(e) => setMedicalCertificate(e.target.files ? e.target.files[0] : null)} accept="application/pdf,image/jpeg,image/png" />
                    </label>
                    {medicalCertificate && (
                        <p className="text-sm text-slate-600 truncate">{medicalCertificate.name}</p>
                    )}
                </div>
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Data de Início</label>
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
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">Data de Fim</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="justification" className="block text-sm font-medium text-slate-700">Justificativa (opcional)</label>
          <textarea
            id="justification"
            rows={4}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="mt-1 block w-full bg-white border border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
          ></textarea>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
          >
            Enviar Solicitação
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestTimeOff;