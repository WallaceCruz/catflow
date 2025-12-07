import React, { memo, useCallback, useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Trash2, Copy, Info, MoreVertical, Play, Pause } from 'lucide-react';
import { NODE_THEME } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { useWorkflowEngine } from '../../hooks/useWorkflowEngine';

interface NodeContainerProps {
  nodeId: string;
  nodeType: string;
  children: React.ReactNode;
  selected?: boolean;
  title: string;
  icon: any;
  color: string;
  brandHex?: string;
  brandHeaderHex?: string;
  handleLeft?: boolean;
  handleRight?: boolean;
  tooltip?: string;
  iconSrc?: string;
  containerRef?: React.Ref<HTMLDivElement>;
}

export const NodeContainer: React.FC<NodeContainerProps> = memo(({ 
  nodeId,
  children, 
  selected, 
  title, 
  icon: Icon, 
  color,
  brandHex,
  brandHeaderHex,
  handleLeft = true,
  handleRight = true,
  tooltip,
  iconSrc,
  containerRef
}) => {
  const { setNodes, getNode } = useReactFlow();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const [imgError, setImgError] = useState(false);
  const { runFromNode, stopWorkflow, isRunning } = useWorkflowEngine();

  const headerBg = NODE_THEME[color as keyof typeof NODE_THEME]?.header || NODE_THEME['slate'].header;
  const headerText = NODE_THEME[color as keyof typeof NODE_THEME]?.headerText || NODE_THEME['slate'].headerText;
  const borderClass = NODE_THEME[color as keyof typeof NODE_THEME]?.border || NODE_THEME['slate'].border;
  const ringClass = selected ? 'ring-2 ring-offset-2 ring-orange-400 dark:ring-offset-slate-900' : '';

  const toRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const brandBgStyleLight = brandHex ? { backgroundColor: toRgba(brandHex, 0.35) } : undefined;
  const brandBgStyleDark = brandHex ? { backgroundColor: toRgba(brandHex, 0.22) } : undefined;
  const headerInlineStyle = brandHeaderHex
    ? (isDarkMode ? brandBgStyleDark : { backgroundColor: brandHeaderHex })
    : (isDarkMode ? brandBgStyleDark : brandBgStyleLight);
  const titleInlineStyle = brandHex ? { color: brandHex } : undefined;
  const COLOR_HEX: Record<string, string> = {
    blue: '#3b82f6',
    purple: '#a855f7',
    indigo: '#6366f1',
    cyan: '#06b6d4',
    teal: '#14b8a6',
    orange: '#f97316',
    amber: '#f59e0b',
    rose: '#f43f5e',
    green: '#10b981',
    slate: '#64748b'
  };
  const useBrand = brandHex && brandHex.toLowerCase() !== '#000000' ? brandHex : undefined;
  const connectorColor = useBrand || COLOR_HEX[color] || '#64748b';
  const connectorBg = toRgba(connectorColor, isDarkMode ? 0.22 : 0.35);

  const onDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
  }, [nodeId, setNodes]);

  const onDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    const node = getNode(nodeId);
    if (!node) return;

    const newNode = {
      ...node,
      id: `${node.type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      position: { x: node.position.x + 20, y: node.position.y + 20 },
      selected: false,
      data: { ...node.data, status: 'idle' }
    };
    
    setNodes((nodes) => nodes.concat(newNode));
  }, [nodeId, getNode, setNodes]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const onPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRunning) runFromNode(nodeId);
  };

  const onStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) stopWorkflow();
  };

  return (
    <div ref={containerRef} className={`relative w-[320px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border-2 ${borderClass} overflow-visible group/node ${ringClass} transition-colors duration-200`} style={brandHex ? { borderColor: brandHex } : undefined}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${brandHeaderHex || brandHex ? '' : headerBg} rounded-t-xl relative border-b border-white/30 dark:border-transparent`} style={headerInlineStyle}>
        <div className={`flex items-center gap-2 ${brandHex ? '' : headerText}`}> 
          {iconSrc && !imgError ? (
            <img src={iconSrc} alt={title} className="w-5 h-5" loading="lazy" onError={() => setImgError(true)} />
          ) : (
            <Icon size={16} strokeWidth={2.5} />
          )}
          <span className={`font-semibold text-sm tracking-wide`} style={titleInlineStyle}>{title}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); if (isRunning) { onStop(e); } else { onPlay(e); } }}
            className={`p-1.5 inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 hover:bg-slate-100 dark:hover:bg-white/10`}
            title={isRunning ? 'Parar execução' : 'Executar a partir deste nó'}
            aria-label={isRunning ? 'Parar execução' : 'Executar a partir deste nó'}
            aria-pressed={isRunning}
          >
            {isRunning 
              ? <Pause size={16} className={`${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`} /> 
              : <Play size={16} className={`${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`} />}
          </button>
          {tooltip && (
            <div className="group/info relative">
              <Info size={14} className={`${isDarkMode ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-800'} cursor-help`} />
              <div className={`absolute bottom-full right-0 mb-2 w-56 p-2 rounded invisible opacity-0 group-hover/info:visible group-hover/info:opacity-100 transition-all z-50 pointer-events-none shadow-2xl ${isDarkMode ? 'bg-black text-white border border-slate-700' : 'bg-white text-slate-800 border border-slate-300'}`}>
                {tooltip}
                <div className={`absolute top-full right-1 -mt-1 border-4 border-transparent ${isDarkMode ? 'border-t-black' : 'border-t-white'}`}></div>
              </div>
            </div>
          )}
          <div className="relative ml-2">
            <button onClick={toggleMenu} className="p-1.5 inline-flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50" title="Mais opções" aria-label="Mais opções">
              <MoreVertical size={16} className={`${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20">
                <button onClick={onDuplicate} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Copy size={14} /> Duplicar
                </button>
                <button onClick={onDelete} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                  <Trash2 size={14} /> Deletar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 bg-white dark:bg-slate-900/40 rounded-b-xl">
        {children}
      </div>

      {/* Handles */}
      {handleLeft && (
          <Handle 
            type="target" 
            position={Position.Left} 
            style={{ left: -60, zIndex: 7, width: 32, height: 32, backgroundColor: connectorBg, borderColor: connectorColor, borderWidth: 3, borderStyle: 'solid', borderRadius: '9999px' }} 
            className={`transition-colors`} 
          />
      )}
      {handleRight && (
          <Handle 
            type="source" 
            position={Position.Right} 
            style={{ right: -60, zIndex: 7, width: 32, height: 32, backgroundColor: connectorBg, borderColor: connectorColor, borderWidth: 3, borderStyle: 'solid', borderRadius: '9999px' }} 
            className={`transition-colors`} 
          />
      )}
    </div>
  );
});
