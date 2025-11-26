import { ImageGenerator } from '../core/interfaces';
import { generateImage } from './geminiService';

export const createImageGenerator = (): ImageGenerator => ({
  /**
   * Gera imagem usando serviço de imagem atual.
   */
  async generate(prompt, model, options) {
    return generateImage(prompt, model, options);
  }
});
