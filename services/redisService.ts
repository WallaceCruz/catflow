import { RedisClient } from '../core/interfaces';

export const createRedisClient = (): RedisClient => ({
  async execute(host, token, action, key, value) {
    const body: any = { command: action, args: action === 'SET' ? [key, String(value ?? '')] : [key] };
    const resp = await fetch(host, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const json = await resp.json().catch(() => ({}));
    return json?.result ?? json ?? null;
  }
});
