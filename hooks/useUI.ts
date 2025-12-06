import { shallow } from 'zustand/shallow';
import { useUIStore } from '../stores/uiStore';

export function useUI() {
  return useUIStore(
    (s) => ({
      searchTerm: s.searchTerm,
      setSearchTerm: s.setSearchTerm,
      showClearModal: s.showClearModal,
      openClearModal: s.openClearModal,
      closeClearModal: s.closeClearModal,
      showControls: s.showControls,
      zoomOnScroll: s.zoomOnScroll,
      panOnDrag: s.panOnDrag,
      animateAllEdges: s.animateAllEdges,
      setShowControls: s.setShowControls,
      setZoomOnScroll: s.setZoomOnScroll,
      setPanOnDrag: s.setPanOnDrag,
      setAnimateAllEdges: s.setAnimateAllEdges,
      toggleShowControls: s.toggleShowControls,
      toggleZoomOnScroll: s.toggleZoomOnScroll,
      togglePanOnDrag: s.togglePanOnDrag,
      toggleAnimateAllEdges: s.toggleAnimateAllEdges,
      inputsOpen: s.inputsOpen,
      textOpen: s.textOpen,
      imageOpen: s.imageOpen,
      outputsOpen: s.outputsOpen,
      communicationOpen: s.communicationOpen,
      flowOpen: s.flowOpen,
      agentsOpen: s.agentsOpen,
      integrationsOpen: s.integrationsOpen,
      toggleInputs: s.toggleInputs,
      toggleText: s.toggleText,
      toggleImage: s.toggleImage,
      toggleOutputs: s.toggleOutputs,
      toggleCommunication: s.toggleCommunication,
      toggleFlow: s.toggleFlow,
      toggleAgents: s.toggleAgents,
      toggleIntegrations: s.toggleIntegrations,
    }),
    shallow
  );
}

export function useUISearch() {
  return useUIStore(
    (s) => ({ searchTerm: s.searchTerm, setSearchTerm: s.setSearchTerm }),
    shallow
  );
}
