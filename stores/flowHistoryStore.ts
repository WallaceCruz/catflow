import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';

export interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

interface FlowHistoryState {
  past: Snapshot[];
  future: Snapshot[];
  push: (current: Snapshot) => void;
  undo: (current: Snapshot) => Snapshot | null;
  redo: (current: Snapshot) => Snapshot | null;
}

export const useFlowHistoryStore = create<FlowHistoryState>()((set, get) => ({
  past: [],
  future: [],
  push: (current) => {
    const past = get().past;
    const newPast = [...past, current];
    set({ past: newPast.length > 50 ? newPast.slice(1) : newPast, future: [] });
  },
  undo: (current) => {
    const { past, future } = get();
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set({ past: newPast, future: [current, ...future] });
    return previous;
  },
  redo: (current) => {
    const { past, future } = get();
    if (future.length === 0) return null;
    const next = future[0];
    const newFuture = future.slice(1);
    set({ past: [...past, current], future: newFuture });
    return next;
  },
}));

