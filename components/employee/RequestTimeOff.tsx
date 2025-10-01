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
  const [approvedByLeader, setApprovedByLeader] = useState('');
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
        justification,
        approvedByLeader: approvedByLeader || undefined,
    };

    onSubmit(requestData);
    
    // Reset form
    setType(TimeOffType.FERIAS);
    setStartDate('');
    setEndDate('');
    setJustification('');
    setApprovedByLeader('');
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
            rows={3}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="mt-1 block w-full bg-white border border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="approvedByLeader" className="block text-sm font-medium text-slate-700">Liberada pelo líder (Opcional)</label>
          <input
            type="text"
            id="approvedByLeader"
            value={approvedByLeader}
            onChange={(e) => setApprovedByLeader(e.target.value)}
            placeholder="Nome do líder que aprovou"
            className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
          />
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