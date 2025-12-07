import { create } from 'zustand';

export interface WorkflowState {
  isRunning: boolean;
  authError: boolean;
  stopRequested: boolean;
  setRunning: (running: boolean) => void;
  setAuthError: (err: boolean) => void;
  startRun: () => void;
  finishRun: () => void;
  stopRun: () => void;
  requestStop: () => void;
  resetStop: () => void;
}

export const useWorkflowStore = create<WorkflowState>()((set) => ({
  isRunning: false,
  authError: false,
  stopRequested: false,
  setRunning: (running) => set({ isRunning: running }),
  setAuthError: (err) => set({ authError: err }),
  startRun: () => set({ isRunning: true, authError: false, stopRequested: false }),
  finishRun: () => set({ isRunning: false, stopRequested: false }),
  stopRun: () => set({ isRunning: false, stopRequested: true }),
  requestStop: () => set({ stopRequested: true }),
  resetStop: () => set({ stopRequested: false }),
}));
