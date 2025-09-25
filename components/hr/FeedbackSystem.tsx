import React from 'react';

const FeedbackSystem: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Sistema de Feedback</h2>
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <p className="mt-4 text-slate-600 text-lg">
          Esta é a página dedicada ao Sistema de Feedback.
        </p>
        <p className="text-sm text-slate-500 mt-2">
          As funcionalidades para gestão de feedback, atividades e ocorrências serão implementadas aqui.
        </p>
      </div>
    </div>
  );
};

export default FeedbackSystem;
