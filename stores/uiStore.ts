import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UIState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showClearModal: boolean;
  openClearModal: () => void;
  closeClearModal: () => void;
  showControls: boolean;
  zoomOnScroll: boolean;
  panOnDrag: boolean;
  setShowControls: (v: boolean) => void;
  setZoomOnScroll: (v: boolean) => void;
  setPanOnDrag: (v: boolean) => void;
  toggleShowControls: () => void;
  toggleZoomOnScroll: () => void;
  togglePanOnDrag: () => void;
  inputsOpen: boolean;
  textOpen: boolean;
  imageOpen: boolean;
  outputsOpen: boolean;
  communicationOpen: boolean;
  flowOpen: boolean;
  agentsOpen: boolean;
  integrationsOpen: boolean;
  toggleInputs: () => void;
  toggleText: () => void;
  toggleImage: () => void;
  toggleOutputs: () => void;
  toggleCommunication: () => void;
  toggleFlow: () => void;
  toggleAgents: () => void;
  toggleIntegrations: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      searchTerm: '',
      setSearchTerm: (term) => set({ searchTerm: term }),
      showClearModal: false,
      openClearModal: () => set({ showClearModal: true }),
      closeClearModal: () => set({ showClearModal: false }),
      showControls: true,
      zoomOnScroll: true,
      panOnDrag: false,
      setShowControls: (v) => set({ showControls: v }),
      setZoomOnScroll: (v) => set({ zoomOnScroll: v }),
      setPanOnDrag: (v) => set({ panOnDrag: v }),
      toggleShowControls: () => set((s) => ({ showControls: !s.showControls })),
      toggleZoomOnScroll: () => set((s) => ({ zoomOnScroll: !s.zoomOnScroll })),
      togglePanOnDrag: () => set((s) => ({ panOnDrag: !s.panOnDrag })),
      inputsOpen: true,
      textOpen: true,
      imageOpen: true,
      outputsOpen: true,
      communicationOpen: true,
      flowOpen: true,
      agentsOpen: true,
      integrationsOpen: true,
      toggleInputs: () => set((s) => ({ inputsOpen: !s.inputsOpen })),
      toggleText: () => set((s) => ({ textOpen: !s.textOpen })),
      toggleImage: () => set((s) => ({ imageOpen: !s.imageOpen })),
      toggleOutputs: () => set((s) => ({ outputsOpen: !s.outputsOpen })),
      toggleCommunication: () => set((s) => ({ communicationOpen: !s.communicationOpen })),
      toggleFlow: () => set((s) => ({ flowOpen: !s.flowOpen })),
      toggleAgents: () => set((s) => ({ agentsOpen: !s.agentsOpen })),
      toggleIntegrations: () => set((s) => ({ integrationsOpen: !s.integrationsOpen })),
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        searchTerm: state.searchTerm,
        showControls: state.showControls,
        zoomOnScroll: state.zoomOnScroll,
        panOnDrag: state.panOnDrag,
        inputsOpen: state.inputsOpen,
        textOpen: state.textOpen,
        imageOpen: state.imageOpen,
        outputsOpen: state.outputsOpen,
        communicationOpen: state.communicationOpen,
        flowOpen: state.flowOpen,
        agentsOpen: state.agentsOpen,
        integrationsOpen: state.integrationsOpen,
      }),
    }
  )
);
