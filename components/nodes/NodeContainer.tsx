import React, { memo, useCallback, useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Trash2, Copy, Info, MoreVertical } from 'lucide-react';
import { NODE_COLORS, NODE_THEME } from '../../config';

interface NodeContainerProps {
  nodeId: string;
  nodeType: string;
  children: React.ReactNode;
  selected?: boolean;
  title: string;
  icon: any;
  color: string;
  handleLeft?: boolean;
  handleRight?: boolean;
  tooltip?: string;
  iconSrc?: string;
}

export const NodeContainer: React.FC<NodeContainerProps> = memo(({ 
  nodeId,
  children, 
  selected, 
  title, 
  icon: Icon, 
  color,
  handleLeft = true,
  handleRight = true,
  tooltip,
  iconSrc
}) => {
  const { setNodes, getNode } = useReactFlow();
  const [menuOpen, setMenuOpen] = useState(false);

  const headerBg = NODE_THEME[color as keyof typeof NODE_THEME]?.header || NODE_THEME['slate'].header;
  const headerText = NODE_THEME[color as keyof typeof NODE_THEME]?.headerText || NODE_THEME['slate'].headerText;
  const borderClass = NODE_THEME[color as keyof typeof NODE_THEME]?.border || NODE_THEME['slate'].border;
  const handleBg = NODE_THEME[color as keyof typeof NODE_THEME]?.handleBg || NODE_THEME['slate'].handleBg;
  const handleBorder = NODE_THEME[color as keyof typeof NODE_THEME]?.handleBorder || NODE_THEME['slate'].handleBorder;
  const handleHover = NODE_THEME[color as keyof typeof NODE_THEME]?.handleHover || NODE_THEME['slate'].handleHover;
  const ringClass = selected ? 'ring-2 ring-offset-2 ring-orange-400 dark:ring-offset-slate-900' : '';

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
      id: `${node.type}-${Math.random().toString(36).substr(2, 9)}`,
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

  return (
    <div className={`relative w-[320px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border-2 ${borderClass} overflow-visible group/node ${ringClass} transition-colors duration-200`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${headerBg} rounded-t-xl relative border-b border-white/30 dark:border-transparent`}>
        <div className={`flex items-center gap-2 ${headerText}`}> 
          {iconSrc ? (
            <img src={iconSrc} alt="icon" className="w-5 h-5" />
          ) : (
            <Icon size={16} strokeWidth={2.5} />
          )}
          <span className="font-semibold text-sm tracking-wide">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          {tooltip && (
            <div className="group/info relative">
              <Info size={14} className="text-white/70 hover:text-white cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 dark:bg-black text-white text-[10px] rounded shadow-lg invisible opacity-0 group-hover/info:visible group-hover/info:opacity-100 transition-all z-50 pointer-events-none">
                {tooltip}
                <div className="absolute top-full right-1 -mt-1 border-4 border-transparent border-t-slate-800 dark:border-t-black"></div>
              </div>
            </div>
          )}
          <div className="relative ml-2">
            <button onClick={toggleMenu} className="p-1.5 rounded-md bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition-colors" title="Mais opções">
              <MoreVertical size={14} />
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
          <Handle type="target" position={Position.Left} style={{ left: -32, zIndex: 5 }} className={`w-5 h-5 border-2 transition-colors ${handleBg} ${handleBorder} ${handleHover} rounded-full`} />
      )}
      {handleRight && (
          <Handle type="source" position={Position.Right} style={{ right: -32, zIndex: 5 }} className={`w-5 h-5 border-2 transition-colors ${handleBg} ${handleBorder} ${handleHover} rounded-full`} />
      )}
    </div>
  );
});
