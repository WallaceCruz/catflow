
import { GoogleGenAI } from "@google/genai";

// Note: We do NOT instantiate a global client here. 
// We must create a new instance inside each function to pick up the latest API_KEY from the environment/dialog.

/**
 * Maps internal node types or common names to Google GenAI SDK Model IDs.
 */
const getModelId = (modelType: string): string => {
  switch (modelType) {
    // Text Models
    case 'gemini3Pro': return 'gemini-3-pro-preview';
    case 'geminiFlash': return 'gemini-2.5-flash';
    case 'geminiFlashLite': return 'gemini-flash-lite-latest';
    case 'promptEnhancer': return 'gemini-2.5-flash';
    
    // Image Models
    case 'gemini-3-pro-image-preview': return 'gemini-3-pro-image-preview';
    case 'gemini-2.5-flash-image': return 'gemini-2.5-flash-image';
    default: return 'gemini-2.5-flash';
  }
};

interface TextGenerationOptions {
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

/**
 * Generic text generation for different Gemini models.
 */
export const generateText = async (
  prompt: string,
  modelTypeOrId: string,
  options: TextGenerationOptions = {}
): Promise<string> => {
  if (!prompt) return "";
  
  // Initialize client on demand to ensure we use the currently selected API Key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // If the passed string looks like a model ID (contains hyphens or starts with gemini), use it directly.
  // Otherwise, look it up in the mapping.
  const modelId = (modelTypeOrId.includes('-') || modelTypeOrId.startsWith('gemini')) 
    ? modelTypeOrId 
    : getModelId(modelTypeOrId);
  
  // Use provided system instruction or fallback for legacy calls
  const systemInstruction = options.systemInstruction 
    ? options.systemInstruction 
    : "You are a creative AI assistant. Refine or expand upon the user's input to create better descriptions for image generation, or answer the user's query directly if it's a question. Keep it concise.";

  const temperature = typeof options.temperature === 'number' ? options.temperature : 0.7;
  const maxOutputTokens = typeof options.maxTokens === 'number' ? options.maxTokens : 1024;
  const timeoutMs = typeof options.timeoutMs === 'number' ? options.timeoutMs : 10000;

  try {
    const requestPromise = ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction,
        temperature,
        maxOutputTokens,
      }
    });
    const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), Math.max(1000, timeoutMs)));
    const response = await Promise.race([requestPromise, timeoutPromise]);
    return (response as any).text || String(prompt);
  } catch (error) {
    console.error(`Error generating text with ${modelId}:`, error);
    throw error;
  }
};

/**
 * Legacy wrapper for compatibility
 */
export const enhancePrompt = async (prompt: string): Promise<string> => {
  return generateText(prompt, 'geminiFlash');
};

interface ImageGenerationOptions {
    aspectRatio?: string;
    resolution?: string;
}

/**
 * Generates an image based on a text prompt and specific model.
 */
export const generateImage = async (
    prompt: string, 
    model: string = 'gemini-2.5-flash-image',
    options: ImageGenerationOptions = {}
): Promise<string> => {
  if (!prompt) throw new Error("Prompt is required");

  // Initialize client on demand to ensure we use the currently selected API Key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const { aspectRatio = "1:1", resolution = "1K" } = options;

  // Determine correct config based on model
  let config: any = {};
  
  // Nano Banana Pro (Gemini 3 Pro Image) supports 'imageSize' and aspect ratio
  if (model === 'gemini-3-pro-image-preview') {
      config = {
        imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: resolution // '1K', '2K', '4K'
        }
      };
  } else {
      // Nano Banana (Flash Image) - Only supports aspectRatio
      // IMPORTANT: ensure aspectRatio is passed correctly here for gemini-2.5-flash-image
      config = {
        imageConfig: {
            aspectRatio: aspectRatio,
        }
      };
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: config
    });

    // Extract image from response
    const parts = (response as any)?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part?.inlineData?.data) {
        const mt = part.inlineData.mimeType || 'image/png';
        return `data:${mt};base64,${part.inlineData.data}`;
      }
      if (part?.fileData?.uri) {
        return String(part.fileData.uri);
      }
    }

    if (model !== 'gemini-2.5-flash-image') {
      return generateImage(prompt, 'gemini-2.5-flash-image', { aspectRatio });
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error(`Error generating image with ${model}:`, error);
    throw error;
  }
};
