import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkflowStore } from '../stores/workflowStore';

describe('Workflow Store', () => {
  beforeEach(() => {
    useWorkflowStore.setState({ isRunning: false, authError: false });
  });

  it('startRun e finishRun controlam isRunning', () => {
    useWorkflowStore.getState().startRun();
    expect(useWorkflowStore.getState().isRunning).toBe(true);
    useWorkflowStore.getState().finishRun();
    expect(useWorkflowStore.getState().isRunning).toBe(false);
  });

  it('setAuthError ajusta estado de erro de autenticação', () => {
    useWorkflowStore.getState().setAuthError(true);
    expect(useWorkflowStore.getState().authError).toBe(true);
    useWorkflowStore.getState().setAuthError(false);
    expect(useWorkflowStore.getState().authError).toBe(false);
  });
});

