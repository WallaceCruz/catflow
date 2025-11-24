import React from 'react';
import { Loader2 } from 'lucide-react';

export const StatusBadge = ({ status }: { status?: string }) => {
  if (status === 'running') return <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-300 px-2 py-0.5 rounded-full"><Loader2 size={10} className="animate-spin"/> Processando</span>;
  if (status === 'completed') return <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 rounded-full">Sucesso</span>;
  if (status === 'error') return <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300 px-2 py-0.5 rounded-full">Erro</span>;
  return <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">Pronto</span>;
};

export const LabelArea = ({ label, children }: { label: string, children?: React.ReactNode }) => (
  <div className="flex flex-col gap-1 mb-2">
    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    {children}
  </div>
);