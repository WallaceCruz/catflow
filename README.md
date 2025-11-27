<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1L0Tq4rF2YXzIkLjESLlGE8bxjx-yU1X8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# FlowGen AI
## Integração com Gmail

- Configuração no nó Gmail:
  - Operação: selecione entre "Enviar e-mail", "Ler e-mail", "Pesquisar e-mail".
  - OAuth: informe `Client ID`, `Redirect URI` e `Scope`. Clique em "Continuar com Google" para autenticar via OAuth 2.0 (PKCE).
  - Segurança: o token de acesso não é persistido em salvamento/compartilhamento/deploy.

- Enviar e-mail:
  - Campos obrigatórios: Destinatário, Assunto, Corpo.
  - Opcionais: Formato HTML, Anexos.
  - Botão "Enviar e-mail" valida os campos e envia pela API do Gmail.

- Ler e-mail:
  - Filtros: Caixa (ex.: INBOX), Remetente, Data inicial e final.
  - Lista resultados com paginação via API; permite visualizar mensagem selecionada.

- Pesquisar e-mail:
  - Campo de busca avançada (ex.: `from:foo after:2024-01-01`).
  - Resultados exibidos em lista; clique para visualizar.

- Erros e logs:
  - Erros da API são mostrados na UI do nó.
  - Operações são registradas via utilitário de log.
