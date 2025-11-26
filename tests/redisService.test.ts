import { describe, it, expect, vi } from 'vitest';
import { createRedisClient } from '../services/redisService';

describe('RedisService', () => {
  it('calls REST endpoint with proper payload', async () => {
    const host = 'https://upstash.example.com';
    const token = 'tkn';
    const fetchSpy = vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      json: () => Promise.resolve({ result: 'OK' })
    } as any);
    const svc = createRedisClient();
    const res = await svc.execute(host, token, 'SET', 'mykey', 'value');
    expect(res).toBe('OK');
    expect(fetchSpy).toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
