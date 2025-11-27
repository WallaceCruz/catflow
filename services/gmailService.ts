export interface GmailAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  codeChallenge: string;
}

export interface GmailTokenConfig {
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}

const toBase64Url = (bytes: Uint8Array) => {
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const pkceCreate = async () => {
  const rand = new Uint8Array(32);
  crypto.getRandomValues(rand);
  const verifier = toBase64Url(rand);
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const challenge = toBase64Url(new Uint8Array(hash));
  return { verifier, challenge };
};

export const buildAuthUrl = (cfg: GmailAuthConfig) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    scope: cfg.scope,
    state: cfg.state,
    code_challenge: cfg.codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent'
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const exchangeCode = async (cfg: GmailTokenConfig) => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: cfg.code,
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    code_verifier: cfg.codeVerifier
  });
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.error || 'TOKEN_EXCHANGE_FAILED');
  return json;
};

export const gmailListMessages = async (accessToken: string, query?: string, labelIds?: string[], pageToken?: string, maxResults = 10) => {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (labelIds && labelIds.length) params.set('labelIds', labelIds.join(','));
  if (pageToken) params.set('pageToken', pageToken);
  params.set('maxResults', String(maxResults));
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.error?.message || 'LIST_FAILED');
  return json;
};

export const gmailGetMessage = async (accessToken: string, id: string) => {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.error?.message || 'GET_FAILED');
  return json;
};

const buildRawMessage = (to: string, subject: string, body: string, isHtml?: boolean, attachments?: Array<{ name: string; type: string; data: string }>) => {
  if (attachments && attachments.length) {
    const boundary = `boundary_${Date.now().toString(36)}`;
    let mime = '';
    mime += `To: ${to}\r\n`;
    mime += `Subject: ${subject}\r\n`;
    mime += `MIME-Version: 1.0\r\n`;
    mime += `Content-Type: multipart/mixed; boundary=${boundary}\r\n\r\n`;
    mime += `--${boundary}\r\n`;
    mime += `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset="UTF-8"\r\n\r\n`;
    mime += `${body}\r\n\r\n`;
    for (const att of attachments) {
      mime += `--${boundary}\r\n`;
      mime += `Content-Type: ${att.type}; name="${att.name}"\r\n`;
      mime += `Content-Transfer-Encoding: base64\r\n`;
      mime += `Content-Disposition: attachment; filename="${att.name}"\r\n\r\n`;
      mime += `${att.data}\r\n\r\n`;
    }
    mime += `--${boundary}--`;
    return btoa(mime).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  const headers = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset="UTF-8"`
  ];
  const raw = `${headers.join('\r\n')}\r\n\r\n${body}`;
  return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const gmailSendMessage = async (accessToken: string, to: string, subject: string, body: string, isHtml?: boolean, attachments?: Array<{ name: string; type: string; data: string }>) => {
  const raw = buildRawMessage(to, subject, body, isHtml, attachments);
  const resp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw })
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.error?.message || 'SEND_FAILED');
  return json;
};

