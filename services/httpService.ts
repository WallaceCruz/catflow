import { Logger } from '../core/interfaces';

export interface HttpRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: string;
  timeoutMs?: number;
}

export interface HttpResponseData {
  ok: boolean;
  status: number;
  headers: Record<string, string>;
  text: string;
  json?: any;
  xml?: any;
}

export const createHttpClient = (logger: Logger) => {
  const request = async (opts: HttpRequestOptions): Promise<HttpResponseData> => {
    const urlObj = new URL(opts.url);
    if (urlObj.protocol !== 'https:') {
      return { ok: false, status: 0, headers: {}, text: 'INSECURE_PROTOCOL' };
    }
    const params = opts.params || {};
    for (const k of Object.keys(params)) {
      const v = params[k];
      if (Array.isArray(v)) {
        for (const item of v) urlObj.searchParams.append(k, String(item));
      } else if (v !== undefined && v !== null) {
        urlObj.searchParams.set(k, String(v));
      }
    }
    const headers: Record<string, string> = {};
    if (opts.headers) {
      for (const k of Object.keys(opts.headers)) headers[k] = String(opts.headers[k]);
    }
    const controller = new AbortController();
    const timeout = Math.max(0, Number(opts.timeoutMs || 0));
    const to = timeout > 0 ? setTimeout(() => controller.abort(), timeout) : null;
    try {
      const resp = await fetch(urlObj.toString(), {
        method: opts.method,
        headers,
        body: ['GET','DELETE'].includes(opts.method) ? undefined : opts.body,
        signal: controller.signal,
      });
      const rawHeaders: Record<string, string> = {};
      resp.headers.forEach((v, k) => { rawHeaders[k.toLowerCase()] = v; });
      const text = await resp.text();
      let json: any = undefined;
      let xml: any = undefined;
      const ct = rawHeaders['content-type'] || '';
      if (ct.includes('application/json')) {
        try { json = JSON.parse(text); } catch {}
      } else if (ct.includes('xml')) {
        try {
          const parser = new DOMParser();
          xml = parser.parseFromString(text, 'application/xml');
        } catch {}
      }
      const data: HttpResponseData = { ok: resp.ok, status: resp.status, headers: rawHeaders, text, json, xml };
      return data;
    } catch (e: any) {
      logger.error('HTTP request failed', { message: String(e?.message || e) });
      return { ok: false, status: 0, headers: {}, text: String(e?.message || 'Request failed') };
    } finally {
      if (to) clearTimeout(to);
    }
  };
  return { request };
};
