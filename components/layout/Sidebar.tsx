import React, { useState, useEffect } from 'react';
import { Layout, Type, Eye, GripVertical, Upload, Zap, ChevronDown, Search, Video, GitBranch, Code2, Filter, Timer, FileText, FileCode } from 'lucide-react';
import { NodeType } from '../../types';
import { NODE_CONFIGS } from '../../config';

interface SidebarItemProps {
  type: NodeType;
  icon?: any;
  iconSrc?: string;
  label: string;
}

const SidebarItem = ({ type, icon: Icon, iconSrc, label }: SidebarItemProps) => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className="group relative flex items-center gap-2 p-2 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-grab hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-150 mb-2"
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      <div className={`w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center`}> 
        {iconSrc ? (
          <img src={iconSrc} alt="icon" className="w-4 h-4" loading="lazy" decoding="async" />
        ) : (
          Icon ? <Icon size={16} className="text-slate-600 dark:text-slate-300" /> : null
        )}
      </div>
      <div className="flex-1">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block leading-tight">{label}</span>
      </div>
      <div className="text-slate-300 dark:text-slate-600">
        <GripVertical size={14} />
      </div>
    </div>
  );
};

const Collapsible = ({ open, maxHeight, children }: { open: boolean; maxHeight?: number; children: React.ReactNode }) => (
  <div className={`overflow-hidden transition-all duration-200 ease-out`} style={{ maxHeight: open ? (maxHeight ?? 9999) : 0 }}>
    {children}
  </div>
);

export const Sidebar = () => {
  const [inputsOpen, setInputsOpen] = useState(true);
  const [textOpen, setTextOpen] = useState(true);
  const [imageOpen, setImageOpen] = useState(true);
  const [outputsOpen, setOutputsOpen] = useState(true);
  const [communicationOpen, setCommunicationOpen] = useState(true);
  const [flowOpen, setFlowOpen] = useState(true);
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [integrationsOpen, setIntegrationsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const matches = (label: string) => label.toLowerCase().includes(searchTerm.toLowerCase());
  useEffect(() => {
    if (searchTerm) {
      setInputsOpen(true);
      setTextOpen(true);
      setImageOpen(true);
      setOutputsOpen(true);
      setAgentsOpen(true);
      setIntegrationsOpen(true);
      setCommunicationOpen(true);
      setFlowOpen(true);
    }
  }, [searchTerm]);
  const inputsCount = ['User Prompt', 'Upload Image', 'Upload Video', 'Upload XML', 'Upload PDF'].filter(matches).length;
  const textCount = ['Gemini 3 Pro', 'Gemini 2.5 Flash', 'Gemini Flash Lite', 'Prompt Expert'].filter(matches).length;
  const imageCount = ['Nano Banana', 'Nano Banana Pro'].filter(matches).length;
  const outputsCount = ['Image Viewer', 'Video Viewer', 'Message Output'].filter(matches).length;
  const agentsCount = ['Claude AI', 'Deepseek', 'OpenAI', 'Mistral AI', 'Hugging Face', 'Kimi', 'Grok'].filter(matches).length;
  const integrationsCount = ['Supabase', 'Redis', 'Microsoft Excel', 'Microsoft Word', 'Upstash', 'PostgreSQL', 'TypeORM', 'Neon', 'SQL Server'].filter(matches).length;
  const communicationCount = ['WhatsApp', 'Discord', 'Gmail', 'Telegram', 'Microsoft Teams', 'Outlook', 'Webhook', 'YouTube'].filter(matches).length;
  const flowCount = ['Router', 'Function', 'Condition', 'Wait'].filter(matches).length;
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-30 transition-colors duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 text-orange-600 mb-1">
          <Zap size={24} fill="currentColor" />
          <h1 className="font-extrabold text-xl tracking-tight text-slate-800 dark:text-white">FlowGen AI</h1>
        </div>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Visual Generative Pipeline</p>
      </div>

      {/* Instructions */}
      <div className="px-6 py-3 bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
         <Layout size={12} className="text-slate-400 dark:text-slate-500"/>
         <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Drag nodes to canvas</span>
      </div>
      
      {/* Scrollable Container */}
      <div
        className="p-5 overflow-y-scroll flex-1 custom-scrollbar overflow-x-hidden overscroll-y-contain overscroll-x-none"
        onWheel={(e) => e.stopPropagation()}
        style={{ scrollbarGutter: 'stable both-edges' }}
      >
        <div className="mb-3 relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar blocos..."
            aria-label="Buscar blocos"
            className="w-full pl-8 pr-2 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between px-1 mb-2 cursor-pointer" onClick={() => setFlowOpen(v => !v)}>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ChevronDown size={14} className={`${flowOpen ? '' : 'rotate-180'} transition-transform`} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Flow Control</h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{flowCount}</span>
          </div>
          <Collapsible open={flowOpen}>
            {(!searchTerm || matches('Router')) && (
              <SidebarItem type={NodeType.ROUTER} icon={GitBranch} label="Router" />
            )}
            {(!searchTerm || matches('Function')) && (
              <SidebarItem type={NodeType.FUNCTION} icon={Code2} label="Function" />
            )}
            {(!searchTerm || matches('Condition')) && (
              <SidebarItem type={NodeType.CONDITION} icon={Filter} label="Condition" />
            )}
            {(!searchTerm || matches('Wait')) && (
              <SidebarItem type={NodeType.WAIT} icon={Timer} label="Wait" />
            )}
          </Collapsible>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between px-1 mb-2 cursor-pointer" onClick={() => setCommunicationOpen(v => !v)}>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ChevronDown size={14} className={`${communicationOpen ? '' : 'rotate-180'} transition-transform`} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Communication</h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{communicationCount}</span>
          </div>
          <Collapsible open={communicationOpen}>
            {(!searchTerm || matches('WhatsApp')) && (
              <SidebarItem type={NodeType.WHATSAPP} iconSrc={NODE_CONFIGS[NodeType.WHATSAPP].iconSrc} label="WhatsApp" />
            )}
            {(!searchTerm || matches('Discord')) && (
              <SidebarItem type={NodeType.DISCORD} iconSrc={NODE_CONFIGS[NodeType.DISCORD].iconSrc} label="Discord" />
            )}
            {(!searchTerm || matches('Gmail')) && (
              <SidebarItem type={NodeType.GMAIL} iconSrc={NODE_CONFIGS[NodeType.GMAIL].iconSrc} label="Gmail" />
            )}
            {(!searchTerm || matches('Telegram')) && (
              <SidebarItem type={NodeType.TELEGRAM} iconSrc={NODE_CONFIGS[NodeType.TELEGRAM].iconSrc} label="Telegram" />
            )}
          {(!searchTerm || matches('Webhook')) && (
            <SidebarItem type={NodeType.WEBHOOK} iconSrc={NODE_CONFIGS[NodeType.WEBHOOK].iconSrc} label="Webhook" />
          )}
          {(!searchTerm || matches('YouTube')) && (
            <SidebarItem type={NodeType.YOUTUBE} iconSrc={NODE_CONFIGS[NodeType.YOUTUBE].iconSrc} label="YouTube" />
          )}
            {(!searchTerm || matches('Microsoft Teams')) && (
              <SidebarItem type={NodeType.TEAMS} iconSrc={NODE_CONFIGS[NodeType.TEAMS].iconSrc} label="Microsoft Teams" />
            )}
            {(!searchTerm || matches('Outlook')) && (
              <SidebarItem type={NodeType.OUTLOOK} iconSrc={NODE_CONFIGS[NodeType.OUTLOOK].iconSrc} label="Outlook" />
            )}
          </Collapsible>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between px-1 mb-2 cursor-pointer" onClick={() => setInputsOpen(v => !v)}>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ChevronDown size={14} className={`${inputsOpen ? '' : 'rotate-180'} transition-transform`} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Inputs</h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{inputsCount}</span>
          </div>
          <Collapsible open={inputsOpen}>
            {(!searchTerm || matches('User Prompt')) && (
              <SidebarItem type={NodeType.PROMPT_INPUT} icon={Type} label="User Prompt"/>
            )}
            {(!searchTerm || matches('Upload Image')) && (
              <SidebarItem type={NodeType.IMAGE_UPLOAD} icon={Upload} label="Upload Image"/>
            )}
            {(!searchTerm || matches('Upload Video')) && (
              <SidebarItem type={NodeType.VIDEO_UPLOAD} icon={Video} label="Upload Video"/>
            )}
            {(!searchTerm || matches('Upload XML')) && (
              <SidebarItem type={NodeType.XML_UPLOAD} icon={FileCode} label="Upload XML"/>
            )}
            {(!searchTerm || matches('Upload PDF')) && (
              <SidebarItem type={NodeType.PDF_UPLOAD} icon={FileText} label="Upload PDF"/>
            )}
          </Collapsible>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between px-1 mb-2 cursor-pointer" onClick={() => setTextOpen(v => !v)}>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ChevronDown size={14} className={`${textOpen ? '' : 'rotate-180'} transition-transform`} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Text Agents</h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{textCount}</span>
          </div>
          <Collapsible open={textOpen}>
          {(!searchTerm || matches('Gemini 3 Pro')) && (
            <SidebarItem type={NodeType.GEMINI_3_PRO} iconSrc={NODE_CONFIGS[NodeType.GEMINI_3_PRO].iconSrc} label="Gemini 3 Pro" />
          )}
            {(!searchTerm || matches('Gemini 2.5 Flash')) && (
              <SidebarItem type={NodeType.GEMINI_2_5_FLASH} iconSrc={NODE_CONFIGS[NodeType.GEMINI_2_5_FLASH].iconSrc} label="Gemini 2.5 Flash" />
            )}
            {(!searchTerm || matches('Gemini Flash Lite')) && (
              <SidebarItem type={NodeType.GEMINI_FLASH_LITE} iconSrc={NODE_CONFIGS[NodeType.GEMINI_FLASH_LITE].iconSrc} label="Gemini Flash Lite" />
            )}
            {(!searchTerm || matches('Prompt Expert')) && (
              <SidebarItem type={NodeType.PROMPT_ENHANCER} iconSrc={NODE_CONFIGS[NodeType.PROMPT_ENHANCER].iconSrc} label="Prompt Expert" />
            )}
          </Collapsible>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between px-1 mb-2 cursor-pointer" onClick={() => setImageOpen(v => !v)}>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ChevronDown size={14} className={`${imageOpen ? '' : 'rotate-180'} transition-transform`} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Image Generation</h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{imageCount}</span>
          </div>
          <Collapsible open={imageOpen}>
            {(!searchTerm || matches('Nano Banana')) && (
              <SidebarItem type={NodeType.NANO_BANANA} iconSrc={NODE_CONFIGS[NodeType.NANO_BANANA].iconSrc} label="Nano Banana" />
            )}
            {(!searchTerm || matches('Nano Banana Pro')) && (
              <SidebarItem type={NodeType.NANO_BANANA_PRO} iconSrc={NODE_CONFIGS[NodeType.NANO_BANANA_PRO].iconSrc} label="Nano Banana Pro" />
            )}
          </Collapsible>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between px-1 mb-2 cursor-pointer" onClick={() => setAgentsOpen(v => !v)}>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ChevronDown size={14} className={`${agentsOpen ? '' : 'rotate-180'} transition-transform`} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Agents</h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{agentsCount}</span>
          </div>
          <Collapsible open={agentsOpen}>
          {(!searchTerm || matches('Claude AI')) && (
            <SidebarItem type={NodeType.CLAUDE_AGENT} iconSrc={NODE_CONFIGS[NodeType.CLAUDE_AGENT].iconSrc} label="Claude AI" />
          )}
          {(!searchTerm || matches('Deepseek')) && (
            <SidebarItem type={NodeType.DEEPSEEK_AGENT} iconSrc={NODE_CONFIGS[NodeType.DEEPSEEK_AGENT].iconSrc} label="Deepseek" />
          )}
          {(!searchTerm || matches('OpenAI')) && (
            <SidebarItem type={NodeType.OPENAI_AGENT} iconSrc={NODE_CONFIGS[NodeType.OPENAI_AGENT].iconSrc} label="OpenAI" />
          )}
          {(!searchTerm || matches('Mistral AI')) && (
            <SidebarItem type={NodeType.MISTRAL_AGENT} iconSrc={NODE_CONFIGS[NodeType.MISTRAL_AGENT].iconSrc} label="Mistral AI" />
          )}
          {(!searchTerm || matches('Hugging Face')) && (
            <SidebarItem type={NodeType.HUGGING_FACE_AGENT} iconSrc={NODE_CONFIGS[NodeType.HUGGING_FACE_AGENT].iconSrc} label="Hugging Face" />
          )}
          {(!searchTerm || matches('Kimi')) && (
            <SidebarItem type={NodeType.KIMI_AGENT} iconSrc={NODE_CONFIGS[NodeType.KIMI_AGENT].iconSrc} label="Kimi" />
          )}
          {(!searchTerm || matches('Grok')) && (
            <SidebarItem type={NodeType.GROK_AGENT} iconSrc={NODE_CONFIGS[NodeType.GROK_AGENT].iconSrc} label="Grok" />
          )}
          </Collapsible>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between px-1 mb-2 cursor-pointer" onClick={() => setIntegrationsOpen(v => !v)}>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ChevronDown size={14} className={`${integrationsOpen ? '' : 'rotate-180'} transition-transform`} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Integrations</h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{integrationsCount}</span>
          </div>
          <Collapsible open={integrationsOpen}>
          {(!searchTerm || matches('Supabase')) && (
            <SidebarItem type={NodeType.SUPABASE} iconSrc={NODE_CONFIGS[NodeType.SUPABASE].iconSrc} label="Supabase" />
          )}
          {(!searchTerm || matches('Redis')) && (
            <SidebarItem type={NodeType.REDIS} iconSrc={NODE_CONFIGS[NodeType.REDIS].iconSrc} label="Redis" />
          )}
          {(!searchTerm || matches('Upstash')) && (
            <SidebarItem type={NodeType.UPSTASH} iconSrc={NODE_CONFIGS[NodeType.UPSTASH].iconSrc} label="Upstash" />
          )}
          {(!searchTerm || matches('PostgreSQL')) && (
            <SidebarItem type={NodeType.POSTGRESQL} iconSrc={NODE_CONFIGS[NodeType.POSTGRESQL].iconSrc} label="PostgreSQL" />
          )}
          {(!searchTerm || matches('TypeORM')) && (
            <SidebarItem type={NodeType.TYPEORM} iconSrc={NODE_CONFIGS[NodeType.TYPEORM].iconSrc} label="TypeORM" />
          )}
          {(!searchTerm || matches('Neon')) && (
            <SidebarItem type={NodeType.NEON} iconSrc={NODE_CONFIGS[NodeType.NEON].iconSrc} label="Neon" />
          )}
          {(!searchTerm || matches('SQL Server')) && (
            <SidebarItem type={NodeType.SQL_SERVER} iconSrc={NODE_CONFIGS[NodeType.SQL_SERVER].iconSrc} label="SQL Server" />
          )}
            {(!searchTerm || matches('Microsoft Excel')) && (
              <SidebarItem type={NodeType.EXCEL} iconSrc={NODE_CONFIGS[NodeType.EXCEL].iconSrc} label="Microsoft Excel" />
            )}
            {(!searchTerm || matches('Microsoft Word')) && (
              <SidebarItem type={NodeType.WORD} iconSrc={NODE_CONFIGS[NodeType.WORD].iconSrc} label="Microsoft Word" />
            )}
          </Collapsible>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between px-1 mb-2 cursor-pointer" onClick={() => setOutputsOpen(v => !v)}>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ChevronDown size={14} className={`${outputsOpen ? '' : 'rotate-180'} transition-transform`} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Outputs</h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{outputsCount}</span>
          </div>
          <Collapsible open={outputsOpen}>
            {(!searchTerm || matches('Image Viewer')) && (
              <SidebarItem type={NodeType.IMAGE_DISPLAY} icon={Eye} label="Image Viewer" />
            )}
            {(!searchTerm || matches('Video Viewer')) && (
              <SidebarItem type={NodeType.VIDEO_DISPLAY} icon={Video} label="Video Viewer" />
            )}
            {(!searchTerm || matches('Message Output')) && (
              <SidebarItem type={NodeType.MESSAGE_OUTPUT} icon={Type} label="Message Output" />
            )}
          </Collapsible>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
         <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <span>v1.3.1</span>
            <span>Gemini Ecosystem</span>
         </div>
      </div>
    </aside>
  );
};
