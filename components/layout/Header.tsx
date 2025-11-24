import React from 'react';
import { Undo, Redo, Key, Trash2, Save, Play, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSelectKey: () => void;
  onClear: () => void;
  onSave: () => void;
  onRun: () => void;
  isRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onUndo, onRedo, canUndo, canRedo, onSelectKey, onClear, onSave, onRun, isRunning
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme} 
        className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all mr-2"
        title={isDarkMode ? "Light Mode" : "Dark Mode"}
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="flex gap-1 mr-4 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-lg px-2 py-1 items-center">
        <button onClick={onUndo} disabled={!canUndo} className={`p-2 rounded-full transition-colors ${!canUndo ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-500'}`} title="Undo (Ctrl+Z)">
          <Undo size={18} />
        </button>
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
        <button onClick={onRedo} disabled={!canRedo} className={`p-2 rounded-full transition-colors ${!canRedo ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-500'}`} title="Redo (Ctrl+Y)">
          <Redo size={18} />
        </button>
      </div>
      
      <button onClick={onSelectKey} className="flex items-center gap-2 px-4 py-3 rounded-full font-semibold shadow-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform hover:scale-105 active:scale-95" title="Configurar API Key">
        <Key size={18} /><span className="text-sm hidden md:inline">Key</span>
      </button>

      <button onClick={onClear} className="flex items-center gap-2 px-4 py-3 rounded-full font-semibold shadow-lg bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all transform hover:scale-105 active:scale-95" title="Limpar Canvas">
        <Trash2 size={18} /><span className="text-sm hidden md:inline">Clear</span>
      </button>

      <button onClick={onSave} className="flex items-center gap-2 px-4 py-3 rounded-full font-semibold shadow-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform hover:scale-105 active:scale-95" title="Salvar estado atual">
        <Save size={18} /><span className="text-sm hidden md:inline">Save</span>
      </button>

      <button onClick={onRun} disabled={isRunning} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105 active:scale-95 ${isRunning ? 'bg-orange-300 dark:bg-orange-800 cursor-not-allowed text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
        {isRunning ? <span className="animate-spin mr-2">●</span> : <Play size={20} fill="currentColor" />}
        {isRunning ? 'Executando...' : 'Run Flow'}
      </button>
    </div>
  );
};