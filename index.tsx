import React from 'react';
import './styles/tailwind.css';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

try {
  const params = new URLSearchParams(window.location.search);
  if (params.get('oauth') === 'google' && window.opener) {
    const code = params.get('code');
    const state = sessionStorage.getItem('gmail_auth_state') || '';
    if (code) {
      window.opener.postMessage({ type: 'gmail_oauth', code, state }, '*');
      window.close();
    }
  }
} catch {}
