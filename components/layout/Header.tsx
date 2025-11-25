import React, { memo, useEffect, useState } from 'react';
import { Undo, Redo, Key, Trash2, Save, Play, Moon, Sun, User, Settings, LogOut, Share2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSelectKey: () => void;
  onClear: () => void;
  onSave: () => void;
  onShare: () => void;
  onRun: () => void;
  isRunning: boolean;
}

const ThemeToggle = memo(() => {
  const { isDarkMode, toggleTheme } = useTheme();
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  };
  return (
    <button
      onClick={toggleTheme}
      onKeyDown={handleKey}
      role="switch"
      aria-checked={isDarkMode}
      tabIndex={0}
      className="relative w-20 h-12 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 shadow-lg mr-2 hover:bg-white dark:hover:bg-slate-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
      title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
      aria-label={isDarkMode ? 'Tema escuro' : 'Tema claro'}
    >
      <div className="absolute inset-0 flex items-center justify-between px-3">
        <Moon size={16} className={isDarkMode ? 'text-slate-100' : 'text-slate-400'} />
        <Sun size={16} className={isDarkMode ? 'text-slate-400' : 'text-slate-800'} />
      </div>
      <span className={`absolute top-2 left-2 w-8 h-8 rounded-full bg-white dark:bg-slate-200 shadow-md ring-1 ring-slate-300 dark:ring-slate-500 transition-transform duration-200 ease-out ${isDarkMode ? 'translate-x-8' : 'translate-x-0'} flex items-center justify-center`}> 
        {isDarkMode ? (
          <Sun size={14} className="text-slate-800" />
        ) : (
          <Moon size={14} className="text-slate-600" />
        )}
      </span>
      <span className="sr-only">Alternar tema</span>
    </button>
  );
});

export const Header: React.FC<HeaderProps> = ({
  onUndo, onRedo, canUndo, canRedo, onSelectKey, onClear, onSave, onShare, onRun, isRunning
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => {
    const close = () => setProfileOpen(false);
    if (profileOpen) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [profileOpen]);
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <ThemeToggle />

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

      <button onClick={onShare} className="flex items-center gap-2 px-4 py-3 rounded-full font-semibold shadow-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform hover:scale-105 active:scale-95" title="Compartilhar">
        <Share2 size={18} /><span className="text-sm hidden md:inline">Share</span>
      </button>

      <button onClick={onRun} disabled={isRunning} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105 active:scale-95 ${isRunning ? 'bg-orange-300 dark:bg-orange-800 cursor-not-allowed text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
        {isRunning ? <span className="animate-spin mr-2">●</span> : <Play size={20} fill="currentColor" />}
        {isRunning ? 'Executando...' : 'Run Flow'}
      </button>
      <div className="relative">
        <button onClick={(e) => { e.stopPropagation(); setProfileOpen(v => !v); }} className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-lg flex items-center justify-center hover:scale-105 transition">
          <span className="font-bold text-slate-700 dark:text-slate-200">U</span>
        </button>
        {profileOpen && (
          <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-14 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2">
            <div className="px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400">Usuário</div>
            <button className="w-full px-4 py-2 text-sm flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"><User size={16}/> Perfil</button>
            <button className="w-full px-4 py-2 text-sm flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"><Settings size={16}/> Configurações</button>
            <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
            <button className="w-full px-4 py-2 text-sm flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"><LogOut size={16}/> Sair</button>
          </div>
        )}
      </div>
    </div>
  );
};
