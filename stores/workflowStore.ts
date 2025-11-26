import { create } from 'zustand';

export interface WorkflowState {
  isRunning: boolean;
  authError: boolean;
  setRunning: (running: boolean) => void;
  setAuthError: (err: boolean) => void;
  startRun: () => void;
  finishRun: () => void;
}

export const useWorkflowStore = create<WorkflowState>()((set) => ({
  isRunning: false,
  authError: false,
  setRunning: (running) => set({ isRunning: running }),
  setAuthError: (err) => set({ authError: err }),
  startRun: () => set({ isRunning: true, authError: false }),
  finishRun: () => set({ isRunning: false }),
}));

