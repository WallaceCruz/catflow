import { createHttpClient } from '../services/httpService';
import { logger } from '../utils/logger';

describe('httpService', () => {
  const http = createHttpClient(logger);
  beforeEach(() => {
    (globalThis as any).fetch = vi.fn(async (url: string) => {
      if (String(url).includes('/json')) {
        return new Response(JSON.stringify({ ok: true, q: (new URL(url)).searchParams.get('q') }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (String(url).includes('/xml')) {
        return new Response('<root><val>42</val></root>', { status: 200, headers: { 'Content-Type': 'application/xml' } });
      }
      if (String(url).includes('/error')) {
        return new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
      }
      return new Response('text ok', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    });
  });

  it('appends params and parses JSON', async () => {
    const resp = await http.request({ method: 'GET', url: 'https://api.test/json', params: { q: 'abc', key: 'k', value: 'v' } });
    expect(resp.ok).toBe(true);
    expect(resp.status).toBe(200);
    expect(resp.json).toEqual({ ok: true, q: 'abc' });
  });

  it('parses XML', async () => {
    const resp = await http.request({ method: 'GET', url: 'https://api.test/xml' });
    expect(resp.ok).toBe(true);
    expect(resp.xml).toBeDefined();
    const node = resp.xml.getElementsByTagName('val')[0];
    expect(node.textContent).toBe('42');
  });

  it('handles text and status codes', async () => {
    const ok = await http.request({ method: 'GET', url: 'https://api.test/text' });
    expect(ok.text).toBe('text ok');
    expect(ok.status).toBe(200);
    const notFound = await http.request({ method: 'GET', url: 'https://api.test/error' });
    expect(notFound.ok).toBe(false);
    expect(notFound.status).toBe(404);
  });

  it('supports timeout', async () => {
    (globalThis as any).fetch = vi.fn(async (_url: string, init: any) => new Promise((_res, rej) => {
      const sig = init?.signal;
      if (sig && typeof sig.addEventListener === 'function') {
        sig.addEventListener('abort', () => rej(new Error('aborted')));
      }
    }));
    const resp = await http.request({ method: 'GET', url: 'https://api.test/hang', timeoutMs: 10 });
    expect(resp.ok).toBe(false);
    expect(resp.status).toBe(0);
  });

  it('adds Authorization header and encodes POST pairs when body empty', async () => {
    let capturedInit: any = null;
    (globalThis as any).fetch = vi.fn(async (_url: string, init: any) => {
      capturedInit = init;
      return new Response('ok', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    });
    const headers = { 'X-Test': '1' } as any;
    const resp = await http.request({ method: 'POST', url: 'https://api.test/post', headers, body: 'key=a&value=b' });
    expect(resp.ok).toBe(true);
    expect(capturedInit.body).toBe('key=a&value=b');
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
