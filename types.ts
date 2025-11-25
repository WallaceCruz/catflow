

export enum NodeType {
  PROMPT_INPUT = 'promptInput',
  IMAGE_UPLOAD = 'imageUpload',
  VIDEO_UPLOAD = 'videoUpload',
  MESSAGE_OUTPUT = 'messageOutput',
  // Text/LLM Models
  GEMINI_3_PRO = 'gemini3Pro',          // gemini-3-pro-preview
  GEMINI_2_5_FLASH = 'geminiFlash',     // gemini-2.5-flash
  GEMINI_FLASH_LITE = 'geminiFlashLite',// gemini-flash-lite-latest
  PROMPT_ENHANCER = 'promptEnhancer',   // Legacy alias for Flash with specific system prompt
  CLAUDE_AGENT = 'claudeAgent',
  DEEPSEEK_AGENT = 'deepseekAgent',
  OPENAI_AGENT = 'openaiAgent',
  MISTRAL_AGENT = 'mistralAgent',
  
  // Image Models
  IMAGE_GENERATOR = 'imageGenerator', 
  NANO_BANANA = 'nanoBanana',           // gemini-2.5-flash-image
  NANO_BANANA_PRO = 'nanoBananaPro',    // gemini-3-pro-image-preview
  
  IMAGE_DISPLAY = 'imageDisplay',
  VIDEO_DISPLAY = 'videoDisplay',
}

export interface NodeData {
  label: string;
  value?: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  videoUrl?: string;
  videoWidth?: number;
  videoHeight?: number;
  status?: 'idle' | 'running' | 'completed' | 'error';
  onChange?: (value: string) => void;
  output?: string; // The output text passed to the next node
  
  // Image Gen Configurations
  aspectRatio?: string; // "1:1", "16:9", "4:3", "9:16", "3:4"
  resolution?: string;  // "1K", "2K" (Only for Pro models)

  // Model Selection Override
  model?: string; 
  
  // LLM Configurations
  provider?: string;
  systemMessage?: string;
  apiKey?: string;
}

export interface PipelineStepResult {
  nodeId: string;
  output: any;
  success: boolean;
}

declare global {
  interface Window {
    aistudio?: {
      openSelectKey: () => Promise<void>;
    };
  }
}
