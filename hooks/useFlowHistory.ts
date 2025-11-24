
import { useState, useCallback, useEffect } from 'react';
import { useReactFlow, Node, Edge, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges, addEdge, Connection } from 'reactflow';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export function useFlowHistory(
  initialNodes: Node[], 
  initialEdges: Edge[],
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void,
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void
) {
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  
  // Acessamos o estado atual via getNodes/getEdges do ReactFlow para garantir frescor nos snapshots
  const { getNodes, getEdges } = useReactFlow();

  const takeSnapshot = useCallback(() => {
    setPast((oldPast) => {
      // Otimização: Limitar histórico a 50 passos se necessário
      const newPast = [...oldPast, { nodes: getNodes(), edges: getEdges() }];
      return newPast.length > 50 ? newPast.slice(1) : newPast;
    });
    setFuture([]); 
  }, [getNodes, getEdges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture((oldFuture) => [{ nodes: getNodes(), edges: getEdges() }, ...oldFuture]);
    
    setNodes(previous.nodes);
    setEdges(previous.edges);
  }, [past, getNodes, getEdges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast((oldPast) => [...oldPast, { nodes: getNodes(), edges: getEdges() }]);
    setFuture(newFuture);

    setNodes(next.nodes);
    setEdges(next.edges);
  }, [future, getNodes, getEdges, setNodes, setEdges]);

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
