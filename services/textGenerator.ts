import { TextGenerator, Cache } from '../core/interfaces';
import { generateText } from './geminiService';

export const createTextGenerator = (cache?: Cache): TextGenerator => ({
  async generate(prompt, model, options) {
    const useCache = options?.useCache !== false;
    const key = `${model}::${prompt}`;
    if (useCache) {
      const hit = cache?.get(key);
      if (hit) return hit;
    }
    const result = await generateText(prompt, model, options);
    if (useCache) cache?.set(key, result);
    return result;
  }
});
