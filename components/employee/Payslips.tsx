
import React from 'react';
import { Payslip } from '../../types';

interface PayslipsProps {
  payslips: Payslip[];
}

const Payslips: React.FC<PayslipsProps> = ({ payslips }) => {

  const groupedPayslips = payslips.reduce((acc, payslip) => {
    const year = payslip.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(payslip);
    acc[year].sort((a, b) => b.month - a.month);
    return acc;
  }, {} as Record<number, Payslip[]>);

  const sortedYears = Object.keys(groupedPayslips).map(Number).sort((a, b) => b - a);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Meus Contracheques</h2>
      {sortedYears.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-slate-500">
          Nenhum contracheque encontrado.
        </div>
      ) : (
        <div className="space-y-8">
          {sortedYears.map(year => (
            <div key={year}>
              <h3 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">{year}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {groupedPayslips[year].map(payslip => (
                  <div key={payslip.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center transition-transform hover:scale-105">
                    <svg className="w-12 h-12 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium text-slate-800">
                      {new Date(payslip.year, payslip.month - 1).toLocaleString('pt-BR', { month: 'long' })}
                    </p>
                    <p className="text-sm text-slate-500">{payslip.year}</p>
                    <a
                      href={payslip.fileUrl}
                      download
                      onClick={(e) => { e.preventDefault(); alert(`Simulando download de ${payslip.fileUrl}`); }}
                      className="mt-3 w-full text-sm bg-slate-800 text-white py-1.5 px-3 rounded-md hover:bg-slate-900 transition-colors"
                    >
                      Baixar
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payslips;
