import React, { useCallback, useRef, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  BackgroundVariant,
  useReactFlow,
  Node,
} from 'reactflow';

import { NodeType } from './types';
import { PromptInputNode, TextGenNode, ImageGenNode, OutputNode, ImageUploadNode } from './components/CustomNodes';

// Custom Hooks
import { useFlowHistory } from './hooks/useFlowHistory';
import { useWorkflowEngine } from './hooks/useWorkflowEngine';

// Context
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { KeySelectionModal } from './components/layout/KeySelectionModal';
import { ConfirmationModal } from './components/layout/ConfirmationModal';

// --- Configuration ---
const nodeTypes = {
  [NodeType.PROMPT_INPUT]: PromptInputNode,
  [NodeType.IMAGE_UPLOAD]: ImageUploadNode,
  [NodeType.GEMINI_3_PRO]: TextGenNode,
  [NodeType.GEMINI_2_5_FLASH]: TextGenNode,
  [NodeType.GEMINI_FLASH_LITE]: TextGenNode,
  [NodeType.PROMPT_ENHANCER]: TextGenNode,
  [NodeType.IMAGE_GENERATOR]: ImageGenNode, 
  [NodeType.NANO_BANANA]: ImageGenNode,     
  [NodeType.NANO_BANANA_PRO]: ImageGenNode, 
  [NodeType.IMAGE_DISPLAY]: OutputNode,
};

const defaultEdgeOptions = {
  type: 'default',
  animated: true,
  style: { stroke: '#94a3b8', strokeWidth: 3 },
};

const initialNodesData: Node[] = [
  {
    id: '1',
    type: NodeType.PROMPT_INPUT,
    position: { x: 100, y: 200 },
    data: { label: 'Input', value: 'Futuristic city with neon lights', status: 'idle' },
  },
];

// --- Main Flow Component ---
function FlowContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesData);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showClearModal, setShowClearModal] = useState(false);
  
  const { project, toObject } = useReactFlow();
  const { isDarkMode } = useTheme();

  // Hooks
  const { 
    past, future, undo, redo, 
    onNodesChange: onNodesChangeHistory, 
    onEdgesChange: onEdgesChangeHistory, 
    onConnect, 
    onNodeDragStart 
  } = useFlowHistory(nodes, edges, setNodes, setEdges);

  const { runWorkflow, isRunning, authError, setAuthError } = useWorkflowEngine();

  // Combine event handlers from ReactFlow defaults and History hook
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    onNodesChangeHistory(changes);
  }, [onNodesChange, onNodesChangeHistory]);

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);
    onEdgesChangeHistory(changes);
  }, [onEdgesChange, onEdgesChangeHistory]);

  // Drag & Drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const position = project({
        x: event.clientX - (reactFlowBounds?.left || 0),
        y: event.clientY - (reactFlowBounds?.top || 0),
      });

      const newNode: Node = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        position,
        data: { label: `${type} node`, value: '', status: 'idle', aspectRatio: '1:1', resolution: '1K' },
      };

      if (type === NodeType.PROMPT_INPUT) {
         newNode.data.onChange = (val: string) => {
            setNodes((nds) => nds.map((n) => n.id === newNode.id ? { ...n, data: { ...n.data, value: val } } : n));
         };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes]
  );

  // Persistence
  const onSave = useCallback(() => {
    const flow = toObject();
    localStorage.setItem('flowgen-state', JSON.stringify(flow));
    alert('Workflow salvo com sucesso!');
  }, [toObject]);

  // Trigger Modal
  const requestClear = useCallback(() => {
    setShowClearModal(true);
  }, []);

  // Action
  const confirmClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setShowClearModal(false);
  }, [setNodes, setEdges]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
          await window.aistudio.openSelectKey();
          setAuthError(false);
      } catch (e) {
          console.error("Error selecting key:", e);
      }
    }
  };

  // Re-bind input handlers if nodes are loaded from history without functions
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === NodeType.PROMPT_INPUT && !node.data.onChange) {
          return {
            ...node,
            data: { ...node.data, onChange: (val: string) => setNodes(ns => ns.map(n => n.id === node.id ? { ...n, data: { ...n.data, value: val } } : n)) },
          };
        }
        return node;
      })
    );
  }, [nodes.length, setNodes]);

  return (
    <div className="flex w-full h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {authError && (
        <KeySelectionModal onSelect={handleSelectKey} onClose={() => setAuthError(false)} isError={true} />
      )}

      <ConfirmationModal 
        isOpen={showClearModal}
        title="Limpar Fluxo"
        message="Tem certeza que deseja remover todos os nós e conexões? Esta ação não pode ser desfeita e você perderá o trabalho não salvo."
        onClose={() => setShowClearModal(false)}
        onConfirm={confirmClear}
      />

      <Sidebar />
      
      <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
        <Header 
          onUndo={undo} onRedo={redo} canUndo={past.length > 0} canRedo={future.length > 0}
          onSelectKey={handleSelectKey} onClear={requestClear} onSave={onSave} onRun={runWorkflow} isRunning={isRunning}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeDragStart={onNodeDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background 
            color={isDarkMode ? "#64748b" : "#94a3b8"} 
            variant={BackgroundVariant.Dots} 
            gap={isDarkMode ? 24 : 22} 
            size={isDarkMode ? 2 : 3} 
          />
          <Controls className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700 !shadow-lg !m-4 !rounded-lg !fill-slate-600 dark:!fill-slate-300 !text-slate-600 dark:!text-slate-300" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ReactFlowProvider>
        <FlowContent />
      </ReactFlowProvider>
    </ThemeProvider>
  );
}
