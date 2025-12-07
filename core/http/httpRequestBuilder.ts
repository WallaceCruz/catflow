import type { HttpRequestBuilder } from '../interfaces';

export const createHttpRequestBuilder = (): HttpRequestBuilder => {
  const build: HttpRequestBuilder['build'] = (input) => {
    const method = input.method;
    const url = String(input.url || '').trim();
    const timeoutMs = typeof input.timeoutMs === 'number' ? input.timeoutMs : 10000;
    const headers: Record<string, string> = { ...(input.headers || {}) };
    const params: Record<string, any> = { ...(input.params || {}) };
    let body = input.body;

    if (!/^https:\/\//i.test(url)) {
      return { valid: false, reason: 'INSECURE_PROTOCOL', options: { method, url, headers, params, body, timeoutMs } };
    }

    const tokenType = String(input.tokenType || '').trim();
    const accessToken = String(input.accessToken || '').trim();
    if (tokenType && accessToken) {
      headers['Authorization'] = `${tokenType} ${accessToken}`;
    }

    const pairs = Array.isArray(input.pairs) ? input.pairs : [];
    if (pairs.length > 0) {
      const validPairs = pairs.filter(p => String(p?.key || '').trim().length > 0);
      if (validPairs.length !== pairs.length) {
        return { valid: false, reason: 'INVALID_PAIRS', options: { method, url, headers, params, body, timeoutMs } };
      }
      for (const p of validPairs) params[p.key] = String(p.value ?? '');
      if ((method === 'POST' || method === 'PUT') && (!body || body.trim() === '')) {
        const encoded = new URLSearchParams();
        for (const p of validPairs) encoded.append(p.key, String(p.value ?? ''));
        body = encoded.toString();
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }

    return { valid: true, options: { method, url, headers, params, body, timeoutMs } };
  };

  return { build };
};

