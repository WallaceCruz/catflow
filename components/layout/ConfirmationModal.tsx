import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700 relative transform transition-all scale-100">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400 rounded-full mb-4 ring-4 ring-red-50 dark:ring-red-900/20">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">{message}</p>
          
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors active:scale-95">
              Cancelar
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95">
              Sim, Limpar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};