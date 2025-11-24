import React, { memo, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Trash2, Copy, Info } from 'lucide-react';
import { NODE_COLORS } from '../../config';

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
  tooltip
}) => {
  const { setNodes, getNode } = useReactFlow();

  const headerBg = NODE_COLORS[color as keyof typeof NODE_COLORS] || NODE_COLORS['slate'];
  const ringClass = selected ? 'ring-2 ring-offset-2 ring-orange-400 dark:ring-offset-slate-900' : '';

  const onDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
  }, [nodeId, setNodes]);

  const onDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div className={`w-[300px] bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 overflow-visible group/node ${ringClass} transition-colors duration-200`}>
      {/* Header */}
      <div className={`px-3 py-2 flex items-center justify-between ${headerBg} rounded-t-lg relative`}>
        <div className="flex items-center gap-2 text-white">
          <Icon size={16} strokeWidth={2.5} />
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

          <div className="flex gap-1 ml-2 border-l border-white/20 pl-2">
              <button onClick={onDuplicate} className="p-1 rounded bg-white/20 hover:bg-white/40 text-white transition-colors" title="Duplicar">
                  <Copy size={12} />
              </button>
              <button onClick={onDelete} className="p-1 rounded bg-white/20 hover:bg-red-500 text-white transition-colors" title="Deletar">
                  <Trash2 size={12} />
              </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-lg">
        {children}
      </div>

      {/* Handles */}
      {handleLeft && (
        <Handle type="target" position={Position.Left} className="!w-4 !h-4 !bg-slate-200 dark:!bg-slate-600 !border-2 !border-slate-400 dark:!border-slate-500 hover:!bg-orange-500 hover:!border-orange-500 transition-colors -ml-[2px]" />
      )}
      {handleRight && (
        <Handle type="source" position={Position.Right} className="!w-4 !h-4 !bg-slate-200 dark:!bg-slate-600 !border-2 !border-slate-400 dark:!border-slate-500 hover:!bg-orange-500 hover:!border-orange-500 transition-colors -mr-[2px]" />
      )}
    </div>
  );
});