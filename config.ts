

import { NodeType } from './types';
import { Bot, Brain, ZapIcon, Feather, Sparkles, Star, Upload } from 'lucide-react';

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

export const TEXT_MODELS = [
  { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (High IQ)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast)' },
  { id: 'gemini-flash-lite-latest', label: 'Gemini Flash Lite (Eco)' },
];

export const PROVIDERS = [
    { id: 'google', label: 'Google AI' },
];

export interface NodeConfig {
  title: string;
  icon: any;
  color: string;
  tooltip: string;
  defaultModel?: string;
  modelName?: string;
  desc?: string;
}

export const NODE_CONFIGS: Record<string, NodeConfig> = {
  [NodeType.GEMINI_3_PRO]: { 
    title: "Gemini 3 Pro", 
    icon: Brain, 
    color: "indigo", 
    defaultModel: "gemini-3-pro-preview",
    tooltip: "Modelo avançado com alta capacidade de raciocínio. Ideal para prompts complexos e lógica."
  },
  [NodeType.GEMINI_2_5_FLASH]: { 
    title: "Gemini Flash", 
    icon: ZapIcon, 
    color: "cyan", 
    defaultModel: "gemini-2.5-flash",
    tooltip: "Modelo rápido e versátil. Ótimo para tarefas gerais e refinamento de prompts."
  },
  [NodeType.GEMINI_FLASH_LITE]: { 
    title: "Gemini Lite", 
    icon: Feather, 
    color: "teal", 
    defaultModel: "gemini-flash-lite-latest",
    tooltip: "Modelo leve e econômico. Perfeito para tarefas simples e rápidas."
  },
  [NodeType.PROMPT_ENHANCER]: { 
    title: "Prompt Specialist", 
    icon: Bot, 
    color: "purple", 
    defaultModel: "gemini-2.5-flash",
    tooltip: "Especialista em melhorar prompts para geração de imagens mais detalhadas."
  },
  [NodeType.IMAGE_UPLOAD]: {
    title: "Image Upload",
    icon: Upload,
    color: "slate",
    tooltip: "Carregue uma imagem para usar no pipeline."
  },
  [NodeType.NANO_BANANA]: {
    title: "Nano Banana",
    icon: Sparkles,
    color: "amber",
    modelName: "gemini-2.5-flash-image",
    desc: "Rápida geração, otimizado",
    tooltip: "Modelo de imagem rápido (Flash Image). Ideal para gerações rápidas e eficientes."
  },
  [NodeType.NANO_BANANA_PRO]: {
    title: "Nano Banana Pro",
    icon: Star,
    color: "rose",
    modelName: "gemini-3-pro-image",
    desc: "Alta qualidade, 1K resolution",
    tooltip: "Modelo de imagem avançado (Gemini 3 Pro). Suporta resoluções até 2K."
  }
};