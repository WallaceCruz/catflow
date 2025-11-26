# Zustand: Stores e Hooks

## Stores

### UI Store (`stores/uiStore.ts`)
- `searchTerm`: termo de busca da Sidebar (persistido)
- `setSearchTerm(term)`
- `showClearModal`: controle do modal de limpar fluxo
- `openClearModal()` / `closeClearModal()`

### Workflow Store (`stores/workflowStore.ts`)
- `isRunning`: execução corrente do workflow
- `authError`: erro de autenticação
- `setRunning(running)`
- `setAuthError(err)`
- `startRun()` / `finishRun()`

## Hooks

### `hooks/useUI.ts`
- `useUI()`: acesso agrupado ao estado UI com seleção shallow
- `useUISearch()`: seleção enxuta de `searchTerm` e `setSearchTerm`

### `hooks/useWorkflow.ts`
- `useWorkflow()`: acesso a `isRunning`, `authError` e ações

## Integração

- `Sidebar.tsx`: usa `useUI()` para `searchTerm` persistido
- `useWorkflowEngine.ts`: usa `useWorkflowStore` em vez de `useState`
- `App.tsx`: usa `useUI()` para o `ConfirmationModal`

## Testes

- `tests/uiStore.test.ts`: estado e persistência
- `tests/workflowStore.test.ts`: transição de execução e erro
### Flow History Store (`stores/flowHistoryStore.ts`)
- `past` e `future`: pilhas de snapshots (`nodes`, `edges`)
- `push(current)`: adiciona snapshot e limpa `future`
- `undo(current)`: retorna anterior e move `current` para `future`
- `redo(current)`: retorna próximo e move `current` para `past`
### `hooks/useFlowHistory.ts`
- Usa `FlowHistoryStore` para snapshots e undo/redo
- Mantém integração com `ReactFlow` via `getNodes`/`getEdges`
