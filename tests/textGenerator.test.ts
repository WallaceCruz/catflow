import { describe, it, expect, vi } from 'vitest';
import { createTextGenerator } from '../services/textGenerator';

class TestCache { private m = new Map<string, string>(); get(k: string){return this.m.get(k);} set(k:string,v:string){this.m.set(k,v);} }

describe('TextGenerator', () => {
  it('caches results by model+prompt key', async () => {
    const cache = new TestCache();
    const gen = createTextGenerator(cache as any);
    const spy = vi.spyOn(await import('../services/geminiService'), 'generateText').mockResolvedValue('result');
    const r1 = await gen.generate('hello', 'gemini-2.5-flash');
    const r2 = await gen.generate('hello', 'gemini-2.5-flash');
    expect(r1).toBe('result');
    expect(r2).toBe('result');
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
