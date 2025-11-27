import React, { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  BackgroundVariant,
  useReactFlow,
  Node,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { NodeType } from './types';
import { StartNode, PromptInputNode, TextGenNode, ImageGenNode, OutputNode, ImageUploadNode, VideoUploadNode, MessageOutputNode, VideoOutputNode, RedisNode, SupabaseNode, CommunicationNode, RouterNode, FunctionNode, ConditionNode, WaitNode, MergeNode, XmlUploadNode, PdfUploadNode, WebhookNode } from './components/CustomNodes';

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
import { useUI } from './hooks/useUI';

// --- Configuration ---
const nodeTypes = {
  [NodeType.START]: StartNode,
  [NodeType.PROMPT_INPUT]: PromptInputNode,
  [NodeType.IMAGE_UPLOAD]: ImageUploadNode,
  [NodeType.VIDEO_UPLOAD]: VideoUploadNode,
  [NodeType.XML_UPLOAD]: XmlUploadNode,
  [NodeType.PDF_UPLOAD]: PdfUploadNode,
  [NodeType.GEMINI_AGENT]: TextGenNode,
  [NodeType.CLAUDE_AGENT]: TextGenNode,
  [NodeType.DEEPSEEK_AGENT]: TextGenNode,
  [NodeType.OPENAI_AGENT]: TextGenNode,
  [NodeType.MISTRAL_AGENT]: TextGenNode,
  [NodeType.HUGGING_FACE_AGENT]: TextGenNode,
  [NodeType.KIMI_AGENT]: TextGenNode,
  [NodeType.GROK_AGENT]: TextGenNode,
  [NodeType.IMAGE_GENERATOR]: ImageGenNode, 
  [NodeType.NANO_BANANA]: ImageGenNode,     
  [NodeType.NANO_BANANA_PRO]: ImageGenNode, 
  [NodeType.IMAGE_DISPLAY]: OutputNode,
  [NodeType.MESSAGE_OUTPUT]: MessageOutputNode,
  [NodeType.VIDEO_DISPLAY]: VideoOutputNode,
  [NodeType.REDIS]: RedisNode,
  [NodeType.SUPABASE]: SupabaseNode,
  [NodeType.UPSTASH]: RedisNode,
  [NodeType.POSTGRESQL]: CommunicationNode,
  [NodeType.SQL_SERVER]: CommunicationNode,
  [NodeType.NEON]: CommunicationNode,
  [NodeType.TYPEORM]: CommunicationNode,
  [NodeType.WHATSAPP]: CommunicationNode,
  [NodeType.DISCORD]: CommunicationNode,
  [NodeType.GMAIL]: CommunicationNode,
  [NodeType.TELEGRAM]: CommunicationNode,
  [NodeType.YOUTUBE]: CommunicationNode,
  [NodeType.WEBHOOK]: WebhookNode,
  [NodeType.TEAMS]: CommunicationNode,
  [NodeType.OUTLOOK]: CommunicationNode,
  [NodeType.EXCEL]: CommunicationNode,
  [NodeType.WORD]: CommunicationNode,
  [NodeType.ROUTER]: RouterNode,
  [NodeType.FUNCTION]: FunctionNode,
  [NodeType.CONDITION]: ConditionNode,
  [NodeType.WAIT]: WaitNode,
  [NodeType.MERGE]: MergeNode,
};

const RemovableEdge: React.FC<EdgeProps> = (props) => {
  const { setEdges } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
  });
  const remove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((eds) => eds.filter((edge) => edge.id !== props.id));
  };
  const show = () => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setHovered(true);
  };
  const hideDelayed = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setHovered(false), 120);
  };
  return (
    <>
      <BaseEdge id={props.id} path={edgePath} markerEnd={props.markerEnd} style={props.style} />
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(0,0,0,0)"
        strokeWidth={16}
        style={{ pointerEvents: 'stroke' }}
        onMouseEnter={show}
        onMouseLeave={hideDelayed}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(${labelX}px, ${labelY}px) translate(-50%, -50%)`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            pointerEvents: hovered ? 'all' : 'none',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 120ms ease-out'
          }}
        >
          <button
            className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            onClick={remove}
            title="Remover"
            onMouseEnter={show}
            onMouseLeave={hideDelayed}
            onTouchStart={show}
          >
            <X size={12} strokeWidth={3} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const edgeTypes = { removable: RemovableEdge } as const;

 

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
  const { showClearModal, openClearModal, closeClearModal } = useUI();
  
  const { project, toObject } = useReactFlow();
  const { isDarkMode } = useTheme();

  const edgeOptions = useMemo(() => ({
    type: 'removable',
    animated: true,
    style: { stroke: isDarkMode ? '#60a5fa' : '#6366f1', strokeWidth: 3 },
  }), [isDarkMode]);

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

      const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

      const newNode: Node = {
        id: genId(),
        type,
        position,
        data: { label: `${type} node`, value: '', status: 'idle', aspectRatio: '1:1', resolution: '1K' },
      };

      if (type === NodeType.PROMPT_INPUT) {
         newNode.data.onChange = (val: string) => {
            setNodes((nds) => nds.map((n) => n.id === newNode.id 
              ? { ...n, data: { ...n.data, value: val, status: 'idle' } } 
              : n));
         };
      }

      if (type === NodeType.FUNCTION) {
        newNode.data.fnBody = 'return input;';
      }
      if (type === NodeType.CONDITION) {
        newNode.data.conditionExpr = 'input && input.length > 0';
      }
      if (type === NodeType.ROUTER) {
        newNode.data.routerMode = 'all';
        newNode.data.routerIndex = '0';
        newNode.data.routerCount = 3;
      }
      if (type === NodeType.WAIT) {
        newNode.data.waitMs = 1000;
        newNode.data.waitUnit = 'ms';
      }
      if (type === NodeType.START) {
        // Nó inicial não requer input; metadados serão gerados na execução
        newNode.data.executionId = '';
        newNode.data.activatedAt = '';
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes]
  );

  // Persistence
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const stateParam = params.get('state');
      let flow: any = null;
      if (stateParam) {
        const decoded = atob(decodeURIComponent(stateParam));
        flow = JSON.parse(decoded);
      } else {
        const saved = localStorage.getItem('flowgen-state');
        if (saved) flow = JSON.parse(saved);
      }
      if (flow && flow.nodes && flow.edges) {
        setNodes(flow.nodes);
        setEdges(flow.edges);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onSave = useCallback(() => {
    try {
      const flow = toObject();
      const sanitized = {
        ...flow,
        nodes: (flow.nodes || []).map((n: any) => {
          if (n.type === NodeType.WHATSAPP) {
            return { ...n, data: { ...n.data, whatsApiKey: undefined } };
          }
          if (n.type === NodeType.GMAIL) {
            return { ...n, data: { ...n.data, gmailAccessToken: undefined } };
          }
          return n;
        })
      };
      localStorage.setItem('flowgen-state', JSON.stringify(sanitized));
      alert('Workflow salvo com sucesso!');
    } catch {}
  }, [toObject]);

  const onShare = useCallback(() => {
    try {
      const flow = toObject();
      const sanitized = {
        ...flow,
        nodes: (flow.nodes || []).map((n: any) => {
          if (n.type === NodeType.WHATSAPP) {
            return { ...n, data: { ...n.data, whatsApiKey: undefined } };
          }
          if (n.type === NodeType.GMAIL) {
            return { ...n, data: { ...n.data, gmailAccessToken: undefined } };
          }
          return n;
        })
      };
      const encoded = encodeURIComponent(btoa(JSON.stringify(sanitized)));
      const url = `${window.location.origin}${window.location.pathname}?state=${encoded}`;
      if ((navigator as any).share) {
        (navigator as any).share({ title: 'FlowGen AI', text: 'Veja meu workflow', url });
      } else {
        navigator.clipboard.writeText(url);
        alert('Link de compartilhamento copiado!');
      }
    } catch {
      alert('Falha ao gerar link de compartilhamento');
    }
  }, [toObject]);

  const onDeploy = useCallback(() => {
    try {
      const flow = toObject();
      const sanitized = {
        ...flow,
        nodes: (flow.nodes || []).map((n: any) => {
          if (n.type === NodeType.WHATSAPP) {
            return { ...n, data: { ...n.data, whatsApiKey: undefined } };
          }
          if (n.type === NodeType.GMAIL) {
            return { ...n, data: { ...n.data, gmailAccessToken: undefined } };
          }
          return n;
        })
      };
      console.log('[Deploy] Workflow pronto para deploy', sanitized);
      alert('Deploy iniciado!');
    } catch {
      alert('Falha ao iniciar deploy');
    }
  }, [toObject]);

  // Trigger Modal
  const requestClear = useCallback(() => {
    openClearModal();
  }, [openClearModal]);

  // Action
  const confirmClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    closeClearModal();
  }, [setNodes, setEdges, closeClearModal]);

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
            data: { ...node.data, onChange: (val: string) => setNodes(ns => ns.map(n => n.id === node.id ? { ...n, data: { ...n.data, value: val, status: 'idle' } } : n)) },
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
        onClose={() => closeClearModal()}
        onConfirm={confirmClear}
      />

      <Sidebar />
      
      <div className="flex-1 h-full relative ml-80" ref={reactFlowWrapper}>
        <Header 
          onUndo={undo} onRedo={redo} canUndo={past.length > 0} canRedo={future.length > 0}
          onSelectKey={handleSelectKey} onClear={requestClear} onSave={onSave} onShare={onShare} onRun={runWorkflow} isRunning={isRunning} onDeploy={onDeploy}
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
          edgeTypes={edgeTypes}
          defaultEdgeOptions={edgeOptions}
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
