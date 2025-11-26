import { describe, it, expect, beforeEach } from 'vitest';
import { useFlowHistoryStore } from '../stores/flowHistoryStore';

const makeSnapshot = (n: number) => ({ nodes: [{ id: String(n) } as any], edges: [] });

describe('FlowHistory Store', () => {
  beforeEach(() => {
    useFlowHistoryStore.setState({ past: [], future: [] });
  });

  it('push adiciona snapshot e limpa future', () => {
    useFlowHistoryStore.getState().push(makeSnapshot(1));
    useFlowHistoryStore.setState({ future: [makeSnapshot(99)] });
    useFlowHistoryStore.getState().push(makeSnapshot(2));
    const { past, future } = useFlowHistoryStore.getState();
    expect(past.length).toBe(2);
    expect(future.length).toBe(0);
  });

  it('undo retorna snapshot anterior e atualiza pilhas', () => {
    const s1 = makeSnapshot(1);
    const s2 = makeSnapshot(2);
    useFlowHistoryStore.getState().push(s1);
    useFlowHistoryStore.getState().push(s2);
    const prev = useFlowHistoryStore.getState().undo(makeSnapshot(3));
    expect(prev?.nodes[0].id).toBe('2');
    const { past, future } = useFlowHistoryStore.getState();
    expect(past.length).toBe(1);
    expect(future.length).toBe(1);
    expect(future[0].nodes[0].id).toBe('3');
  });

  it('redo retorna próximo e atualiza pilhas', () => {
    const s1 = makeSnapshot(1);
    const s2 = makeSnapshot(2);
    useFlowHistoryStore.setState({ past: [s1], future: [s2] });
    const next = useFlowHistoryStore.getState().redo(makeSnapshot(3));
    expect(next?.nodes[0].id).toBe('2');
    const { past, future } = useFlowHistoryStore.getState();
    expect(past.length).toBe(2);
    expect(future.length).toBe(0);
  });
});

