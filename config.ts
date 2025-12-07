

import { NodeType } from './types';
import { Brain, Sparkles, Star, Upload, Video, Type, Server, GitBranch, Code2, Filter, Timer, FileText, FileCode, Play, Eye } from 'lucide-react';

export const NODE_COLORS = {
  blue: 'bg-blue-500 border-blue-500',
  purple: 'bg-purple-500 border-purple-500',
  indigo: 'bg-indigo-500 border-indigo-500',
  cyan: 'bg-cyan-500 border-cyan-500',
  teal: 'bg-teal-500 border-teal-500',
  orange: 'bg-orange-500 border-orange-500',
  amber: 'bg-amber-500 border-amber-500',
  rose: 'bg-rose-500 border-rose-500',
  green: 'bg-emerald-500 border-emerald-500',
  slate: 'bg-slate-600 border-slate-600'
};

export const GEMINI_LOGO = new URL('./assets/logos/gemini.svg', import.meta.url).href;
export const CLAUDE_LOGO = new URL('./assets/logos/claude-ai.svg', import.meta.url).href;
export const DEEPSEEK_LOGO = new URL('./assets/logos/deepseek.svg', import.meta.url).href;
export const OPENAI_LOGO = new URL('./assets/logos/openai.svg', import.meta.url).href;
export const MISTRAL_LOGO = new URL('./assets/logos/mistral-ai.svg', import.meta.url).href;
export const HUGGING_FACE_LOGO = new URL('./assets/logos/hugging_face.svg', import.meta.url).href;
export const KIMI_LOGO = new URL('./assets/logos/kimi-icon.svg', import.meta.url).href;
export const GROK_LOGO = new URL('./assets/logos/grok-light.svg', import.meta.url).href;
export const REDIS_LOGO = new URL('./assets/logos/redis.svg', import.meta.url).href;
export const SUPABASE_LOGO = new URL('./assets/logos/supabase.svg', import.meta.url).href;
export const POSTGRESQL_LOGO = new URL('./assets/logos/postgresql.svg', import.meta.url).href;
export const TYPEORM_LOGO = new URL('./assets/logos/typeorm.svg', import.meta.url).href;
export const UPSTASH_LOGO = new URL('./assets/logos/upstash.svg', import.meta.url).href;
export const NEON_LOGO = new URL('./assets/logos/neon.svg', import.meta.url).href;
export const SQL_SERVER_LOGO = new URL('./assets/logos/sql-server.svg', import.meta.url).href;
export const DISCORD_LOGO = new URL('./assets/logos/discord.svg', import.meta.url).href;
export const WHATSAPP_LOGO = new URL('./assets/logos/whatsapp.svg', import.meta.url).href;
export const GMAIL_LOGO = new URL('./assets/logos/gmail.svg', import.meta.url).href;
export const TELEGRAM_LOGO = new URL('./assets/logos/telegram.svg', import.meta.url).href;
export const WEBHOOK_LOGO = new URL('./assets/logos/webhook.svg', import.meta.url).href;
export const EXCEL_LOGO = new URL('./assets/logos/microsoft-excel.svg', import.meta.url).href;
export const WORD_LOGO = new URL('./assets/logos/microsoft-word.svg', import.meta.url).href;
export const OUTLOOK_LOGO = new URL('./assets/logos/microsoft-outlook.svg', import.meta.url).href;
export const TEAMS_LOGO = new URL('./assets/logos/microsoft-teams.svg', import.meta.url).href;
export const YOUTUBE_LOGO = new URL('./assets/logos/youtube.svg', import.meta.url).href;

export const NODE_THEME = {
  blue: {
    header: 'bg-blue-100 dark:bg-blue-900/40',
    headerText: 'text-blue-800 dark:text-blue-100',
    border: 'border-blue-400 dark:border-blue-600',
    handleBg: 'bg-blue-200 dark:bg-blue-700',
    handleBorder: 'border-blue-400 dark:border-blue-600',
    handleHover: 'hover:bg-blue-500 hover:border-blue-500'
  },
  purple: {
    header: 'bg-purple-100 dark:bg-purple-900/40',
    headerText: 'text-purple-800 dark:text-purple-100',
    border: 'border-purple-400 dark:border-purple-600',
    handleBg: 'bg-purple-200 dark:bg-purple-700',
    handleBorder: 'border-purple-400 dark:border-purple-600',
    handleHover: 'hover:bg-purple-500 hover:border-purple-500'
  },
  indigo: {
    header: 'bg-indigo-100 dark:bg-indigo-900/40',
    headerText: 'text-indigo-800 dark:text-indigo-100',
    border: 'border-indigo-400 dark:border-indigo-600',
    handleBg: 'bg-indigo-200 dark:bg-indigo-700',
    handleBorder: 'border-indigo-400 dark:border-indigo-600',
    handleHover: 'hover:bg-indigo-500 hover:border-indigo-500'
  },
  cyan: {
    header: 'bg-cyan-100 dark:bg-cyan-900/40',
    headerText: 'text-cyan-800 dark:text-cyan-100',
    border: 'border-cyan-400 dark:border-cyan-600',
    handleBg: 'bg-cyan-200 dark:bg-cyan-700',
    handleBorder: 'border-cyan-400 dark:border-cyan-600',
    handleHover: 'hover:bg-cyan-500 hover:border-cyan-500'
  },
  teal: {
    header: 'bg-teal-100 dark:bg-teal-900/40',
    headerText: 'text-teal-800 dark:text-teal-100',
    border: 'border-teal-400 dark:border-teal-600',
    handleBg: 'bg-teal-200 dark:bg-teal-700',
    handleBorder: 'border-teal-400 dark:border-teal-600',
    handleHover: 'hover:bg-teal-500 hover:border-teal-500'
  },
  orange: {
    header: 'bg-orange-100 dark:bg-orange-900/40',
    headerText: 'text-orange-800 dark:text-orange-100',
    border: 'border-orange-400 dark:border-orange-600',
    handleBg: 'bg-orange-200 dark:bg-orange-700',
    handleBorder: 'border-orange-400 dark:border-orange-600',
    handleHover: 'hover:bg-orange-500 hover:border-orange-500'
  },
  amber: {
    header: 'bg-amber-100 dark:bg-amber-900/40',
    headerText: 'text-amber-800 dark:text-amber-100',
    border: 'border-amber-400 dark:border-amber-600',
    handleBg: 'bg-amber-200 dark:bg-amber-700',
    handleBorder: 'border-amber-400 dark:border-amber-600',
    handleHover: 'hover:bg-amber-500 hover:border-amber-500'
  },
  rose: {
    header: 'bg-rose-100 dark:bg-rose-900/40',
    headerText: 'text-rose-800 dark:text-rose-100',
    border: 'border-rose-400 dark:border-rose-600',
    handleBg: 'bg-rose-200 dark:bg-rose-700',
    handleBorder: 'border-rose-400 dark:border-rose-600',
    handleHover: 'hover:bg-rose-500 hover:border-rose-500'
  },
  green: {
    header: 'bg-emerald-100 dark:bg-emerald-900/40',
    headerText: 'text-emerald-800 dark:text-emerald-100',
    border: 'border-emerald-400 dark:border-emerald-600',
    handleBg: 'bg-emerald-200 dark:bg-emerald-700',
    handleBorder: 'border-emerald-400 dark:border-emerald-600',
    handleHover: 'hover:bg-emerald-500 hover:border-emerald-500'
  },
  slate: {
    header: 'bg-slate-200 dark:bg-slate-800/60',
    headerText: 'text-slate-800 dark:text-slate-100',
    border: 'border-slate-400 dark:border-slate-600',
    handleBg: 'bg-slate-300 dark:bg-slate-700',
    handleBorder: 'border-slate-500 dark:border-slate-600',
    handleHover: 'hover:bg-slate-600 hover:border-slate-600'
  }
};

export const TEXT_MODELS = [
  { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (High IQ)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast)' },
  { id: 'gemini-flash-lite-latest', label: 'Gemini Flash Lite (Eco)' },
];

export const OPENAI_MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
];

export const ANTHROPIC_MODELS = [
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-opus', label: 'Claude 3 Opus' },
];

export const DEEPSEEK_MODELS = [
  { id: 'deepseek-chat', label: 'Deepseek Chat' },
  { id: 'deepseek-reasoner', label: 'Deepseek Reasoner' },
];

export const MISTRAL_MODELS = [
  { id: 'mistral-large', label: 'Mistral Large' },
  { id: 'mistral-small', label: 'Mistral Small' },
];

export const HUGGINGFACE_MODELS = [
  { id: 'meta-llama-3.1-8b-instruct', label: 'Llama 3.1 8B' },
  { id: 'mistral-7b-instruct', label: 'Mistral 7B' },
];

export const KIMI_MODELS = [
  { id: 'kimi-1.5-mini', label: 'Kimi 1.5 Mini' },
  { id: 'kimi-1.5-pro', label: 'Kimi 1.5 Pro' },
];

export const GROK_MODELS = [
  { id: 'grok-2-mini', label: 'Grok 2 Mini' },
  { id: 'grok-2', label: 'Grok 2' },
];

export const PROVIDERS = [
    { id: 'google', label: 'Google AI' },
    { id: 'openai', label: 'OpenAI' },
    { id: 'anthropic', label: 'Claude (Anthropic)' },
    { id: 'deepseek', label: 'Deepseek' },
    { id: 'mistral', label: 'Mistral' },
    { id: 'huggingface', label: 'Hugging Face' },
    { id: 'kimi', label: 'Kimi' },
    { id: 'xai', label: 'xAI (Grok)' },
];

export const AGENT_PROVIDER_MAP: Record<string, string> = {
  [NodeType.GEMINI_AGENT]: 'google',
  [NodeType.CLAUDE_AGENT]: 'anthropic',
  [NodeType.DEEPSEEK_AGENT]: 'deepseek',
  [NodeType.OPENAI_AGENT]: 'openai',
  [NodeType.MISTRAL_AGENT]: 'mistral',
  [NodeType.HUGGING_FACE_AGENT]: 'huggingface',
  [NodeType.KIMI_AGENT]: 'kimi',
  [NodeType.GROK_AGENT]: 'xai',
};

export interface NodeConfig {
  title: string;
  icon: any;
  color: string;
  tooltip: string;
  defaultModel?: string;
  modelName?: string;
  desc?: string;
  iconSrc?: string;
  brandHex?: string;
  brandHeaderHex?: string;
}

export const NODE_CONFIGS: Record<string, NodeConfig> = {
  [NodeType.START]: {
    title: "Início do Processo",
    icon: Play,
    color: "green",
    tooltip: "Nó inicial do fluxo. Define dados iniciais e inicia a execução.",
    brandHex: '#10b981',
    brandHeaderHex: '#ecfdf5'
  },
  [NodeType.IMAGE_UPLOAD]: {
    title: "Image Upload",
    icon: Upload,
    color: "slate",
    tooltip: "Carregue uma imagem para usar no pipeline."
  },
  [NodeType.VIDEO_UPLOAD]: {
    title: "Video Upload",
    icon: Video,
    color: "slate",
    tooltip: "Carregue um vídeo para usar no pipeline."
  },
  [NodeType.XML_UPLOAD]: {
    title: "XML Upload",
    icon: FileCode,
    color: "slate",
    tooltip: "Carregue um arquivo XML para usar como entrada."
  },
  [NodeType.XML_PARSER]: {
    title: "XML Parser",
    icon: FileCode,
    color: "blue",
    tooltip: "Lê XML, converte em objeto e suporta XPath com namespaces."
  },
  [NodeType.XML_VALIDATOR]: {
    title: "XML Validator",
    icon: Code2,
    color: "purple",
    tooltip: "Valida XML: sintaxe, regras XPath e conformidade básica com XSD/DTD."
  },
  [NodeType.PDF_UPLOAD]: {
    title: "PDF Upload",
    icon: FileText,
    color: "slate",
    tooltip: "Carregue um arquivo PDF para usar como entrada."
  },
  [NodeType.MESSAGE_OUTPUT]: {
    title: "Message Output",
    icon: Type,
    color: "green",
    tooltip: "Visualize a mensagem de texto final."
  },
  [NodeType.VIDEO_DISPLAY]: {
    title: "Video Viewer",
    icon: Video,
    color: "green",
    tooltip: "Visualize o vídeo final."
  },
  [NodeType.NANO_BANANA]: {
    title: "Nano Banana",
    icon: Sparkles,
    color: "amber",
    modelName: "gemini-2.5-flash-image",
    desc: "Rápida geração, otimizado",
    tooltip: "Modelo de imagem rápido (Flash Image). Ideal para gerações rápidas e eficientes.",
    iconSrc: GEMINI_LOGO
  },
  [NodeType.NANO_BANANA_PRO]: {
    title: "Nano Banana Pro",
    icon: Star,
    color: "rose",
    modelName: "gemini-3-pro-image-preview",
    desc: "Alta qualidade, 1K resolution",
    tooltip: "Modelo de imagem avançado (Gemini 3 Pro). Suporta resoluções até 2K.",
    iconSrc: GEMINI_LOGO
  }
  ,
  [NodeType.GEMINI_AGENT]: {
    title: "Gemini Agent",
    icon: Brain,
    color: "indigo",
    tooltip: "Agente de texto usando Gemini. Configuração de API, modelo e parâmetros.",
    iconSrc: GEMINI_LOGO,
    defaultModel: 'gemini-2.5-flash',
    brandHex: '#4285F4',
    brandHeaderHex: '#eaf1ff'
  },
  [NodeType.CLAUDE_AGENT]: {
    title: "Claude Agent",
    icon: Brain,
    color: "purple",
    tooltip: "Agente de texto usando Claude.",
    iconSrc: CLAUDE_LOGO,
    defaultModel: 'claude-3-5-sonnet',
    brandHex: '#C36241',
    brandHeaderHex: '#f9efec'
  },
  [NodeType.DEEPSEEK_AGENT]: {
    title: "Deepseek Agent",
    icon: Brain,
    color: "indigo",
    tooltip: "Agente de texto usando Deepseek.",
    iconSrc: DEEPSEEK_LOGO,
    defaultModel: 'deepseek-chat',
    brandHex: '#4C6CFA',
    brandHeaderHex: '#edf0ff'
  },
  [NodeType.OPENAI_AGENT]: {
    title: "OpenAI Agent",
    icon: Brain,
    color: "green",
    tooltip: "Agente de texto usando OpenAI.",
    iconSrc: OPENAI_LOGO,
    defaultModel: 'gpt-4o'
  },
  [NodeType.MISTRAL_AGENT]: {
    title: "Mistral Agent",
    icon: Brain,
    color: "orange",
    tooltip: "Agente de texto usando Mistral.",
    iconSrc: MISTRAL_LOGO,
    defaultModel: 'mistral-large',
    brandHex: '#F45C25'
  }
  ,
  [NodeType.HUGGING_FACE_AGENT]: {
    title: "Hugging Face Agent",
    icon: Brain,
    color: "amber",
    tooltip: "Agente de texto usando Hugging Face.",
    iconSrc: HUGGING_FACE_LOGO,
    defaultModel: 'meta-llama-3.1-8b-instruct',
    brandHex: '#FFCC4D'
  },
  [NodeType.KIMI_AGENT]: {
    title: "Kimi Agent",
    icon: Brain,
    color: "cyan",
    tooltip: "Agente de texto usando Kimi.",
    iconSrc: KIMI_LOGO,
    defaultModel: 'kimi-1.5-mini',
    brandHex: '#00B2FF'
  },
  [NodeType.GROK_AGENT]: {
    title: "Grok Agent",
    icon: Brain,
    color: "indigo",
    tooltip: "Agente de texto usando Grok (xAI).",
    iconSrc: GROK_LOGO,
    defaultModel: 'grok-2-mini',
    brandHex: '#000000'
  }
  ,
  [NodeType.REDIS]: {
    title: "Redis",
    icon: Server,
    color: "rose",
    tooltip: "Persistência/Cache com Redis. Configure conexão e operações.",
    iconSrc: REDIS_LOGO
  },
  [NodeType.SUPABASE]: {
    title: "Supabase",
    icon: Server,
    color: "green",
    tooltip: "Banco de dados e APIs Supabase. Configure URL, chave e tabela.",
    iconSrc: SUPABASE_LOGO,
    brandHex: '#16A249',
    brandHeaderHex: '#e7f5ec'
  }
  ,
  [NodeType.POSTGRESQL]: {
    title: "PostgreSQL",
    icon: Server,
    color: "blue",
    tooltip: "Integração com PostgreSQL.",
    iconSrc: POSTGRESQL_LOGO,
    brandHex: '#336791'
  },
  [NodeType.SQL_SERVER]: {
    title: "SQL Server",
    icon: Server,
    color: "rose",
    tooltip: "Integração com Microsoft SQL Server.",
    iconSrc: SQL_SERVER_LOGO,
    brandHex: '#CC2927'
  },
  [NodeType.NEON]: {
    title: "Neon",
    icon: Server,
    color: "cyan",
    tooltip: "Postgres serverless com Neon.",
    iconSrc: NEON_LOGO,
    brandHex: '#00E699'
  },
  [NodeType.TYPEORM]: {
    title: "TypeORM",
    icon: Server,
    color: "orange",
    tooltip: "Integração ORM com TypeORM.",
    iconSrc: TYPEORM_LOGO,
    brandHex: '#F67F2E'
  },
  [NodeType.UPSTASH]: {
    title: "Upstash",
    icon: Server,
    color: "green",
    tooltip: "Serverless Redis/Queue da Upstash.",
    iconSrc: UPSTASH_LOGO,
    brandHex: '#47C4A2'
  }
  ,
  [NodeType.EXCEL]: {
    title: "Microsoft Excel",
    icon: Server,
    color: "green",
    tooltip: "Integração com Microsoft Excel.",
    iconSrc: EXCEL_LOGO,
    brandHex: '#217346'
  },
  [NodeType.WORD]: {
    title: "Microsoft Word",
    icon: Server,
    color: "blue",
    tooltip: "Integração com Microsoft Word.",
    iconSrc: WORD_LOGO,
    brandHex: '#2B579A'
  }
  ,
  [NodeType.WHATSAPP]: {
    title: "WhatsApp",
    icon: Server,
    color: "green",
    tooltip: "Comunicação via WhatsApp.",
    iconSrc: WHATSAPP_LOGO,
    brandHex: '#25D366',
    brandHeaderHex: '#e9fbef'
  },
  [NodeType.DISCORD]: {
    title: "Discord",
    icon: Server,
    color: "indigo",
    tooltip: "Comunicação via Discord.",
    iconSrc: DISCORD_LOGO,
    brandHex: '#5865F2'
  },
  [NodeType.GMAIL]: {
    title: "Gmail",
    icon: Server,
    color: "rose",
    tooltip: "Comunicação via Gmail.",
    iconSrc: GMAIL_LOGO,
    brandHex: '#EA4335'
  },
  [NodeType.TELEGRAM]: {
    title: "Telegram",
    icon: Server,
    color: "cyan",
    tooltip: "Comunicação via Telegram.",
    iconSrc: TELEGRAM_LOGO,
    brandHex: '#229ED9'
  }
  ,
  [NodeType.WEBHOOK]: {
    title: "Webhook",
    icon: Server,
    color: "purple",
    tooltip: "Recebe requisições HTTP para acionar o fluxo.",
    iconSrc: WEBHOOK_LOGO,
    
  }
  ,
  [NodeType.TEAMS]: {
    title: "Microsoft Teams",
    icon: Server,
    color: "indigo",
    tooltip: "Comunicação via Microsoft Teams.",
    iconSrc: TEAMS_LOGO,
    brandHex: '#6264A7'
  },
  [NodeType.OUTLOOK]: {
    title: "Outlook",
    icon: Server,
    color: "blue",
    tooltip: "Comunicação via Outlook.",
    iconSrc: OUTLOOK_LOGO,
    brandHex: '#0078D4'
  }
  ,
  [NodeType.YOUTUBE]: {
    title: "YouTube",
    icon: Server,
    color: "rose",
    tooltip: "Integração com YouTube.",
    iconSrc: YOUTUBE_LOGO,
    brandHex: '#FF0000'
  }
  ,
  [NodeType.ROUTER]: {
    title: "Router",
    icon: GitBranch,
    color: "indigo",
    tooltip: "Direciona o fluxo para diferentes caminhos.",
  },
  [NodeType.FUNCTION]: {
    title: "Function",
    icon: Code2,
    color: "purple",
    tooltip: "Executa uma função sobre o payload.",
  },
  [NodeType.CONDITION]: {
    title: "Condition",
    icon: Filter,
    color: "amber",
    tooltip: "Avalia condição para seguir o fluxo.",
  }
  ,
  [NodeType.WAIT]: {
    title: "Wait",
    icon: Timer,
    color: "slate",
    tooltip: "Aguarda por um tempo antes de continuar.",
  }
  ,
  [NodeType.HTTP_REQUEST]: {
    title: "HTTP Request",
    icon: Server,
    color: "blue",
    tooltip: "Configura e envia requisições HTTP com validação e timeout.",
  },
  [NodeType.HTTP_RESPONSE]: {
    title: "HTTP Response",
    icon: Eye,
    color: "green",
    tooltip: "Processa e exibe respostas HTTP incluindo status, headers e corpo.",
  }
};
