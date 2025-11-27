import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createWhatsAppClient } from '../services/whatsappService';

describe('WhatsApp Service', () => {
  beforeEach(() => {
    (globalThis as any).fetch = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates config fields', () => {
    const client = createWhatsAppClient();
    const resBad = client.validateConfig({ phone: '123', apiKey: '', endpoint: 'not-a-url', proxyUrl: 'x' });
    expect(resBad.ok).toBe(false);
    expect(resBad.errors.length).toBeGreaterThan(0);

    const resOk = client.validateConfig({ phone: '+5511999999999', apiKey: 'secretkey123', endpoint: 'https://api.example.com' });
    expect(resOk.ok).toBe(true);
    expect(resOk.errors.length).toBe(0);
  });

  it('tests connection by calling endpoint', async () => {
    const client = createWhatsAppClient();
    (globalThis as any).fetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('ok') });
    const res = await client.testConnection({ phone: '+5511999999999', apiKey: 'secretkey123', endpoint: 'https://api.example.com' });
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
  });
});
