import React, { useState } from 'react';
import { MeetingRequest } from '../../types';

interface ScheduleMeetingProps {
    onSubmit: (request: Omit<MeetingRequest, 'id' | 'status' | 'userName' | 'userId'>) => void;
}

const ScheduleMeeting: React.FC<ScheduleMeetingProps> = ({ onSubmit }) => {
    const [topic, setTopic] = useState('');
    const [preferredDateTime, setPreferredDateTime] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic || !preferredDateTime) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        setError('');
        onSubmit({ topic, preferredDateTime });
        setTopic('');
        setPreferredDateTime('');
    };
    
    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Agendar Reunião com RH</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-slate-700">Tópico da Reunião</label>
                    <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="preferredDateTime" className="block text-sm font-medium text-slate-700">Preferência de Data e Hora</label>
                    <input
                        type="datetime-local"
                        id="preferredDateTime"
                        value={preferredDateTime}
                        onChange={(e) => setPreferredDateTime(e.target.value)}
                        className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
                        required
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                    >
                        Solicitar Agendamento
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ScheduleMeeting;