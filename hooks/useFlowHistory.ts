
import { useCallback, useEffect } from 'react';
import { useReactFlow, Node, Edge, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges, addEdge, Connection } from 'reactflow';
import { useFlowHistoryStore } from '../stores/flowHistoryStore';

 

export function useFlowHistory(
  initialNodes: Node[], 
  initialEdges: Edge[],
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void,
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void
) {
  const { past, future, push, undo: undoStore, redo: redoStore } = useFlowHistoryStore((s) => ({
    past: s.past,
    future: s.future,
    push: s.push,
    undo: s.undo,
    redo: s.redo,
  }));
  
  // Acessamos o estado atual via getNodes/getEdges do ReactFlow para garantir frescor nos snapshots
  const { getNodes, getEdges } = useReactFlow();

  const takeSnapshot = useCallback(() => {
    push({ nodes: getNodes(), edges: getEdges() });
  }, [getNodes, getEdges, push]);

  const undo = useCallback(() => {
    const prev = undoStore({ nodes: getNodes(), edges: getEdges() });
    if (!prev) return;
    setNodes(prev.nodes);
    setEdges(prev.edges);
  }, [undoStore, getNodes, getEdges, setNodes, setEdges]);

  const redo = useCallback(() => {
    const next = redoStore({ nodes: getNodes(), edges: getEdges() });
    if (!next) return;
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [redoStore, getNodes, getEdges, setNodes, setEdges]);

  // Wrappers para eventos do React Flow que disparam snapshots
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (changes.some((c) => c.type === 'remove' || c.type === 'add')) {
        takeSnapshot();
      }
      // Nota: Não tiramos snapshot para 'position' ou 'select' a cada pixel arrastado para performance,
      // usamos onNodeDragStart para isso.
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [takeSnapshot, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (changes.some((c) => c.type === 'remove')) {
        takeSnapshot();
      }
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [takeSnapshot, setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      takeSnapshot();
      setEdges((eds) => addEdge({ ...params }, eds));
    },
    [takeSnapshot, setEdges]
  );

  const onNodeDragStart = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  // Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignora se estiver digitando em inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

      if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        event.preventDefault();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'y') {
        redo();
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    past,
    future,
    takeSnapshot,
    undo,
    redo,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDragStart
  };
}
