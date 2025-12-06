

export enum NodeType {
  START = 'start',
  PROMPT_INPUT = 'promptInput',
  IMAGE_UPLOAD = 'imageUpload',
  VIDEO_UPLOAD = 'videoUpload',
  XML_UPLOAD = 'xmlUpload',
  XML_PARSER = 'xmlParser',
  XML_VALIDATOR = 'xmlValidator',
  PDF_UPLOAD = 'pdfUpload',
  MESSAGE_OUTPUT = 'messageOutput',
  // Text/LLM Models
  GEMINI_AGENT = 'geminiAgent',
  CLAUDE_AGENT = 'claudeAgent',
  DEEPSEEK_AGENT = 'deepseekAgent',
  OPENAI_AGENT = 'openaiAgent',
  MISTRAL_AGENT = 'mistralAgent',
  HUGGING_FACE_AGENT = 'huggingFaceAgent',
  KIMI_AGENT = 'kimiAgent',
  GROK_AGENT = 'grokAgent',
  
  // Image Models
  IMAGE_GENERATOR = 'imageGenerator', 
  NANO_BANANA = 'nanoBanana',           // gemini-2.5-flash-image
  NANO_BANANA_PRO = 'nanoBananaPro',    // gemini-3-pro-image-preview
  
  IMAGE_DISPLAY = 'imageDisplay',
  VIDEO_DISPLAY = 'videoDisplay',

  // Integrations
  REDIS = 'redis',
  SUPABASE = 'supabase',
  EXCEL = 'excel',
  WORD = 'word',
  POSTGRESQL = 'postgresql',
  TYPEORM = 'typeorm',
  UPSTASH = 'upstash',
  NEON = 'neon',
  SQL_SERVER = 'sqlServer',

  // Communication
  WHATSAPP = 'whatsapp',
  DISCORD = 'discord',
  GMAIL = 'gmail',
  TELEGRAM = 'telegram',
  WEBHOOK = 'webhook',
  TEAMS = 'teams',
  OUTLOOK = 'outlook',
  YOUTUBE = 'youtube',

  // Flow Control
  ROUTER = 'router',
  FUNCTION = 'function',
  CONDITION = 'condition',
  WAIT = 'wait',
  MERGE = 'merge',
  HTTP_REQUEST = 'httpRequest',
  HTTP_RESPONSE = 'httpResponse',
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
  pdfUrl?: string;
  pdfName?: string;
  xmlContent?: string;
  xmlName?: string;
  xmlNsJson?: string;
  xmlXPath?: string;
  xmlSchemaType?: 'xsd' | 'dtd' | 'none';
  xmlSchema?: string;
  xmlValidationPaths?: string;
  xmlBody?: string;
  xmlObject?: any;
  xmlXPathResult?: any;
  xmlValidationReport?: any;
  xmlValidationErrors?: string[];
  status?: 'idle' | 'pending' | 'running' | 'completed' | 'error' | 'paused';
  onChange?: (value: string) => void;

  output?: string; 

  // Image Gen Configurations
  aspectRatio?: string; // "1:1", "16:9", "4:3", "9:16", "3:4"
  resolution?: string;  // "1K", "2K"

  // Model Selection Override
  model?: string; 
  
  // LLM Configurations
  provider?: string;
  systemMessage?: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  cacheEnabled?: boolean;
  history?: Array<{ prompt: string; model: string; result: string; ts: number }>;

  // Redis Configurations
  redisHost?: string;
  redisPort?: string;
  redisDb?: string;
  redisPassword?: string;
  redisAction?: 'GET' | 'SET' | 'DEL';
  redisKey?: string;
  redisValue?: string;

  // Supabase Configurations
  supabaseUrl?: string;
  supabaseKey?: string;
  supabaseTable?: string;
  supabaseOperation?: 'select' | 'insert' | 'update' | 'delete';
  supabasePayload?: string;

  // Webhook Configurations
  webhookMethod?: 'GET' | 'POST';
  webhookPath?: string;
  webhookSecret?: string;
  webhookContentType?: string;
  webhookPayload?: string;

  gmailOperation?: 'send' | 'read' | 'search';
  gmailClientId?: string;
  gmailRedirectUri?: string;
  gmailScope?: string;
  gmailAccessToken?: string;
  gmailTokenType?: string;
  gmailTokenExpiry?: number;
  gmailIsLoading?: boolean;
  gmailError?: string;
  gmailStatus?: string;
  gmailTo?: string;
  gmailSubject?: string;
  gmailBody?: string;
  gmailIsHtml?: boolean;
  gmailAttachments?: Array<{ name: string; type: string; data: string }>;
  gmailLabel?: string;
  gmailFrom?: string;
  gmailStartDate?: string;
  gmailEndDate?: string;
  gmailPageToken?: string;
  gmailMessages?: Array<{ id: string; snippet: string }>; 
  gmailSelectedMessage?: any;
  gmailQuery?: string;
  whatsPhone?: string;
  whatsApiKey?: string;
  whatsEndpoint?: string;
  whatsProxyUrl?: string;
  whatsError?: string;
  whatsStatus?: string;
  onTestConnection?: () => Promise<void> | void;

  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  httpUrl?: string;
  httpHeaders?: string;
  httpParams?: string;
  httpBody?: string;
  httpTimeoutMs?: number;
  httpLogEnabled?: boolean;
  httpResponseView?: 'auto' | 'json' | 'xml' | 'text';
  httpStatus?: number;
  httpOk?: boolean;
  httpRespHeaders?: Record<string, string>;
  httpBodyText?: string;
  httpBodyJson?: any;
  httpBodyXml?: any;
  httpTokenType?: string;
  httpAccessToken?: string;
  httpPairs?: Array<{ key: string; value: string }>;
  httpAuthError?: string;
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
