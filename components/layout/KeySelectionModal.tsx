import React from 'react';
import { X, Lock, AlertCircle } from 'lucide-react';

interface KeySelectionModalProps {
  onSelect: () => void;
  onClose: () => void;
  isError?: boolean;
}

export const KeySelectionModal: React.FC<KeySelectionModalProps> = ({ onSelect, onClose, isError }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md text-center border border-slate-200 dark:border-slate-700 relative">
      <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
        <X size={20} />
      </button>

      <div className="mb-6 flex justify-center">
        <div className={`p-5 rounded-full ring-4 ${isError ? 'bg-red-100 text-red-500 ring-red-50 dark:bg-red-900/30 dark:ring-red-900/50' : 'bg-orange-100 text-orange-500 ring-orange-50 dark:bg-orange-900/30 dark:ring-orange-900/50'}`}>
          {isError ? <AlertCircle size={40} /> : <Lock size={40} />}
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{isError ? 'Acesso Negado' : 'Acesso Necessário'}</h2>
      <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-sm">
        {isError 
          ? "Ocorreu um erro de permissão (403). O modelo selecionado (provavelmente Pro) requer uma API Key válida associada a um projeto com faturamento ativado."
          : "Para utilizar os modelos avançados como o Gemini 3 Pro e gerar imagens em alta definição, é necessário selecionar sua API Key do Google Cloud."
        }
      </p>
      <button onClick={onSelect} className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg transform transition hover:-translate-y-1 active:translate-y-0">
        Selecionar Nova API Key
      </button>
      <p className="mt-6 text-xs text-slate-400">
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-orange-500">Saiba mais sobre faturamento e acesso aos modelos Pro</a>
      </p>
    </div>
  </div>
);