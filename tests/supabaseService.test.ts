import { describe, it, expect } from 'vitest';
import { createSupabaseClient } from '../services/supabaseService';

describe('SupabaseService', () => {
  it('builds select request with filters and order', () => {
    const svc = createSupabaseClient();
    const req = svc.buildRequest('https://proj.supabase.co', 'key', 'items', 'select', {
      select: '*',
      where: { id: { gte: 10 }, status: 'active' },
      order: { column: 'id', desc: true },
      limit: 5
    }, null);
    expect(req.method).toBe('GET');
    expect(req.url).toContain('/rest/v1/items?');
    expect(req.url).toContain('select=*');
    expect(req.url).toContain('id=gte.10');
    expect(req.url).toContain('status=eq.active');
    expect(req.url).toContain('order=id.desc');
    expect(req.url).toContain('limit=5');
    expect(req.headers['Prefer']).toBe('return=representation');
  });

  it('builds insert request with body', () => {
    const svc = createSupabaseClient();
    const req = svc.buildRequest('https://proj.supabase.co', 'key', 'items', 'insert', { values: { name: 'x' } }, null);
    expect(req.method).toBe('POST');
    expect(req.headers['Content-Type']).toBe('application/json');
    expect(req.body).toBe(JSON.stringify({ name: 'x' }));
  });
});
