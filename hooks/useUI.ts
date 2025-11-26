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
