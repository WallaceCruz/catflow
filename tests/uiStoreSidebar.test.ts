import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../stores/uiStore';

describe('UI Store Sidebar Open States', () => {
  beforeEach(() => {
    useUIStore.setState({
      inputsOpen: true,
      textOpen: true,
      imageOpen: true,
      outputsOpen: true,
      communicationOpen: true,
      flowOpen: true,
      agentsOpen: true,
      integrationsOpen: true,
    } as any);
    localStorage.removeItem('ui-store');
  });

  it('toggleInputs funciona', () => {
    useUIStore.getState().toggleInputs();
    expect(useUIStore.getState().inputsOpen).toBe(false);
  });

  it('toggleFlow funciona', () => {
    useUIStore.getState().toggleFlow();
    expect(useUIStore.getState().flowOpen).toBe(false);
  });
});

