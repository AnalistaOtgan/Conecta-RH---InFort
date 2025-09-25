import React, { useState } from 'react';
import { User } from '../../types';

interface RegisterEmployeeProps {
  onSubmit: (name: string, email: string, emergencyPhone?: string) => void;
  users: User[];
}

const RegisterEmployee: React.FC<RegisterEmployeeProps> = ({ onSubmit, users }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError('Este email já está em uso.');
        return;
    }
    setError('');
    onSubmit(name, email, emergencyPhone);
    setName('');
    setEmail('');
    setEmergencyPhone('');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Cadastrar Novo Funcionário</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
          >
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterEmployee;