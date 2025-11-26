import { shallow } from 'zustand/shallow';
import { useWorkflowStore } from '../stores/workflowStore';

export function useWorkflow() {
  return useWorkflowStore(
    (s) => ({
      isRunning: s.isRunning,
      authError: s.authError,
      setRunning: s.setRunning,
      setAuthError: s.setAuthError,
      startRun: s.startRun,
      finishRun: s.finishRun,
    }),
    shallow
  );
}

