import { TextGenerator, Cache } from '../core/interfaces';
import { generateText } from './geminiService';

export const createTextGenerator = (cache?: Cache): TextGenerator => ({
  /**
   * Gera texto com cache opcional por (model+prompt).
   */
  async generate(prompt, model, options) {
    const key = `${model}::${prompt}`;
    const hit = cache?.get(key);
    if (hit) return hit;
    const result = await generateText(prompt, model, options);
    cache?.set(key, result);
    return result;
  }
});
