import { describe, it, expect } from 'vitest';
import { createHttpRequestBuilder } from '../core/http/httpRequestBuilder';

describe('HttpRequestBuilder', () => {
  const builder = createHttpRequestBuilder();

  it('rejects non-https URLs', () => {
    const b = builder.build({ method: 'GET', url: 'http://insecure', params: {}, headers: {} });
    expect(b.valid).toBe(false);
    expect(b.reason).toBe('INSECURE_PROTOCOL');
  });

  it('adds Authorization header when token provided', () => {
    const b = builder.build({ method: 'GET', url: 'https://ok', tokenType: 'Bearer', accessToken: 'abc', params: {}, headers: {} });
    expect(b.valid).toBe(true);
    expect(b.options.headers.Authorization).toBe('Bearer abc');
  });

  it('merges pairs into params and encodes body for POST', () => {
    const b = builder.build({ method: 'POST', url: 'https://ok', params: { q: 1 }, headers: {}, pairs: [{ key: 'key', value: 'v' }, { key: 'value', value: '2' }] });
    expect(b.valid).toBe(true);
    expect(b.options.params.key).toBe('v');
    expect(b.options.params.value).toBe('2');
    expect(b.options.body).toContain('key=v');
    expect(b.options.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
  });

  it('invalid pairs cause error', () => {
    const b = builder.build({ method: 'GET', url: 'https://ok', pairs: [{ key: '', value: 'x' }] });
    expect(b.valid).toBe(false);
    expect(b.reason).toBe('INVALID_PAIRS');
  });
});

