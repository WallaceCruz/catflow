import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../stores/uiStore';

describe('UI Store', () => {
  beforeEach(() => {
    useUIStore.setState({ searchTerm: '', showClearModal: false });
    localStorage.removeItem('ui-store');
  });

  it('atualiza searchTerm', () => {
    useUIStore.getState().setSearchTerm('abc');
    expect(useUIStore.getState().searchTerm).toBe('abc');
  });

  it('controla modal de limpar fluxo', () => {
    expect(useUIStore.getState().showClearModal).toBe(false);
    useUIStore.getState().openClearModal();
    expect(useUIStore.getState().showClearModal).toBe(true);
    useUIStore.getState().closeClearModal();
    expect(useUIStore.getState().showClearModal).toBe(false);
  });

  it('persiste searchTerm em localStorage', async () => {
    useUIStore.getState().setSearchTerm('persistido');
    const raw = localStorage.getItem('ui-store');
    expect(raw).toBeTruthy();
    const parsed = raw ? JSON.parse(raw) : null;
    expect(parsed?.state?.searchTerm).toBe('persistido');
  });
});

