

import { NodeType } from './types';
import { Bot, Brain, ZapIcon, Feather, Sparkles, Star, Upload, Video, Type } from 'lucide-react';

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

export const GEMINI_LOGO = '/assets/logos/gemini.svg';

export const NODE_THEME = {
  blue: {
    header: 'bg-blue-50 dark:bg-blue-900/20',
    headerText: 'text-blue-700 dark:text-blue-200',
    border: 'border-blue-300 dark:border-blue-700',
    handleBg: 'bg-blue-100 dark:bg-blue-800',
    handleBorder: 'border-blue-300 dark:border-blue-600',
    handleHover: 'hover:bg-blue-400 hover:border-blue-400'
  },
  purple: {
    header: 'bg-purple-50 dark:bg-purple-900/20',
    headerText: 'text-purple-700 dark:text-purple-200',
    border: 'border-purple-300 dark:border-purple-700',
    handleBg: 'bg-purple-100 dark:bg-purple-800',
    handleBorder: 'border-purple-300 dark:border-purple-600',
    handleHover: 'hover:bg-purple-400 hover:border-purple-400'
  },
  indigo: {
    header: 'bg-indigo-50 dark:bg-indigo-900/20',
    headerText: 'text-indigo-700 dark:text-indigo-200',
    border: 'border-indigo-300 dark:border-indigo-700',
    handleBg: 'bg-indigo-100 dark:bg-indigo-800',
    handleBorder: 'border-indigo-300 dark:border-indigo-600',
    handleHover: 'hover:bg-indigo-400 hover:border-indigo-400'
  },
  cyan: {
    header: 'bg-cyan-50 dark:bg-cyan-900/20',
    headerText: 'text-cyan-700 dark:text-cyan-200',
    border: 'border-cyan-300 dark:border-cyan-700',
    handleBg: 'bg-cyan-100 dark:bg-cyan-800',
    handleBorder: 'border-cyan-300 dark:border-cyan-600',
    handleHover: 'hover:bg-cyan-400 hover:border-cyan-400'
  },
  teal: {
    header: 'bg-teal-50 dark:bg-teal-900/20',
    headerText: 'text-teal-700 dark:text-teal-200',
    border: 'border-teal-300 dark:border-teal-700',
    handleBg: 'bg-teal-100 dark:bg-teal-800',
    handleBorder: 'border-teal-300 dark:border-teal-600',
    handleHover: 'hover:bg-teal-400 hover:border-teal-400'
  },
  orange: {
    header: 'bg-orange-50 dark:bg-orange-900/20',
    headerText: 'text-orange-700 dark:text-orange-200',
    border: 'border-orange-300 dark:border-orange-700',
    handleBg: 'bg-orange-100 dark:bg-orange-800',
    handleBorder: 'border-orange-300 dark:border-orange-600',
    handleHover: 'hover:bg-orange-400 hover:border-orange-400'
  },
  amber: {
    header: 'bg-amber-50 dark:bg-amber-900/20',
    headerText: 'text-amber-700 dark:text-amber-200',
    border: 'border-amber-300 dark:border-amber-700',
    handleBg: 'bg-amber-100 dark:bg-amber-800',
    handleBorder: 'border-amber-300 dark:border-amber-600',
    handleHover: 'hover:bg-amber-400 hover:border-amber-400'
  },
  rose: {
    header: 'bg-rose-50 dark:bg-rose-900/20',
    headerText: 'text-rose-700 dark:text-rose-200',
    border: 'border-rose-300 dark:border-rose-700',
    handleBg: 'bg-rose-100 dark:bg-rose-800',
    handleBorder: 'border-rose-300 dark:border-rose-600',
    handleHover: 'hover:bg-rose-400 hover:border-rose-400'
  },
  green: {
    header: 'bg-emerald-50 dark:bg-emerald-900/20',
    headerText: 'text-emerald-700 dark:text-emerald-200',
    border: 'border-emerald-300 dark:border-emerald-700',
    handleBg: 'bg-emerald-100 dark:bg-emerald-800',
    handleBorder: 'border-emerald-300 dark:border-emerald-600',
    handleHover: 'hover:bg-emerald-400 hover:border-emerald-400'
  },
  slate: {
    header: 'bg-slate-100 dark:bg-slate-800/40',
    headerText: 'text-slate-700 dark:text-slate-200',
    border: 'border-slate-300 dark:border-slate-700',
    handleBg: 'bg-slate-200 dark:bg-slate-700',
    handleBorder: 'border-slate-400 dark:border-slate-600',
    handleHover: 'hover:bg-slate-500 hover:border-slate-500'
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

export const PROVIDERS = [
    { id: 'google', label: 'Google AI' },
    { id: 'openai', label: 'OpenAI' },
    { id: 'anthropic', label: 'Claude (Anthropic)' },
    { id: 'deepseek', label: 'Deepseek' },
    { id: 'mistral', label: 'Mistral' },
];

export interface NodeConfig {
  title: string;
  icon: any;
  color: string;
  tooltip: string;
  defaultModel?: string;
  modelName?: string;
  desc?: string;
  iconSrc?: string;
}

export const NODE_CONFIGS: Record<string, NodeConfig> = {
  [NodeType.GEMINI_3_PRO]: { 
    title: "Gemini 3 Pro", 
    icon: Brain, 
    color: "indigo", 
    defaultModel: "gemini-3-pro-preview",
    tooltip: "Modelo avançado com alta capacidade de raciocínio. Ideal para prompts complexos e lógica.",
    iconSrc: GEMINI_LOGO
  },
  [NodeType.GEMINI_2_5_FLASH]: { 
    title: "Gemini Flash", 
    icon: ZapIcon, 
    color: "cyan", 
    defaultModel: "gemini-2.5-flash",
    tooltip: "Modelo rápido e versátil. Ótimo para tarefas gerais e refinamento de prompts.",
    iconSrc: GEMINI_LOGO
  },
  [NodeType.GEMINI_FLASH_LITE]: { 
    title: "Gemini Lite", 
    icon: Feather, 
    color: "teal", 
    defaultModel: "gemini-flash-lite-latest",
    tooltip: "Modelo leve e econômico. Perfeito para tarefas simples e rápidas.",
    iconSrc: GEMINI_LOGO
  },
  [NodeType.PROMPT_ENHANCER]: { 
    title: "Prompt Specialist", 
    icon: Bot, 
    color: "purple", 
    defaultModel: "gemini-2.5-flash",
    tooltip: "Especialista em melhorar prompts para geração de imagens mais detalhadas.",
    iconSrc: GEMINI_LOGO
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
    modelName: "gemini-3-pro-image",
    desc: "Alta qualidade, 1K resolution",
    tooltip: "Modelo de imagem avançado (Gemini 3 Pro). Suporta resoluções até 2K.",
    iconSrc: GEMINI_LOGO
  }
  ,
  [NodeType.CLAUDE_AGENT]: {
    title: "Claude Agent",
    icon: Brain,
    color: "purple",
    tooltip: "Agente de texto usando Claude.",
    iconSrc: '/assets/logos/claude-ai.svg',
    defaultModel: 'gemini-2.5-flash'
  },
  [NodeType.DEEPSEEK_AGENT]: {
    title: "Deepseek Agent",
    icon: Brain,
    color: "orange",
    tooltip: "Agente de texto usando Deepseek.",
    iconSrc: '/assets/logos/deepseek.svg',
    defaultModel: 'gemini-2.5-flash'
  },
  [NodeType.OPENAI_AGENT]: {
    title: "OpenAI Agent",
    icon: Brain,
    color: "green",
    tooltip: "Agente de texto usando OpenAI.",
    iconSrc: '/assets/logos/openai.svg',
    defaultModel: 'gemini-2.5-flash'
  },
  [NodeType.MISTRAL_AGENT]: {
    title: "Mistral Agent",
    icon: Brain,
    color: "indigo",
    tooltip: "Agente de texto usando Mistral.",
    iconSrc: '/assets/logos/mistral-ai.svg',
    defaultModel: 'gemini-2.5-flash'
  }
};
