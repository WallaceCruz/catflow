import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pkceCreate, buildAuthUrl, exchangeCode, gmailListMessages } from '../services/gmailService';

describe('Gmail Service', () => {
  beforeEach(() => {
    (globalThis as any).fetch = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates PKCE verifier and challenge', async () => {
    const { verifier, challenge } = await pkceCreate();
    expect(verifier.length).toBeGreaterThan(10);
    expect(challenge.length).toBeGreaterThan(10);
  });

  it('builds auth url with params', () => {
    const url = buildAuthUrl({ clientId: 'cid', redirectUri: 'http://localhost/', scope: 'scope', state: 'state', codeChallenge: 'challenge' });
    expect(url).toContain('client_id=cid');
    expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%2F');
    expect(url).toContain('scope=scope');
    expect(url).toContain('state=state');
    expect(url).toContain('code_challenge=challenge');
  });

  it('lists messages using token', async () => {
    (globalThis as any).fetch.mockResolvedValue({ ok: true, json: async () => ({ messages: [{ id: '1' }] }) });
    const res = await gmailListMessages('token', 'from:test');
    expect(res.messages[0].id).toBe('1');
  });

  it('exchanges code for token', async () => {
    (globalThis as any).fetch.mockResolvedValue({ ok: true, json: async () => ({ access_token: 'at', token_type: 'Bearer', expires_in: 3600 }) });
    const tok = await exchangeCode({ clientId: 'cid', code: 'code', redirectUri: 'http://localhost/', codeVerifier: 'ver' });
    expect(tok.access_token).toBe('at');
  });
});
