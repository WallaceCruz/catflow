import React, { useState, useEffect } from 'react';
import { Layout, Type, Eye, GripVertical, Upload, Zap, ChevronDown, Search, Video } from 'lucide-react';
import { NodeType } from '../../types';
import { GEMINI_LOGO } from '../../config';

interface SidebarItemProps {
  type: NodeType;
  icon?: any;
  iconSrc?: string;
  label: string;
  colorClass: string;
}

const SidebarItem = ({ type, icon: Icon, iconSrc, label, colorClass }: SidebarItemProps) => {
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
          <img src={iconSrc} alt="icon" className="w-4 h-4" />
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
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const matches = (label: string) => label.toLowerCase().includes(searchTerm.toLowerCase());
  useEffect(() => {
    if (searchTerm) {
      setInputsOpen(true);
      setTextOpen(true);
      setImageOpen(true);
      setOutputsOpen(true);
      setAgentsOpen(true);
    }
  }, [searchTerm]);
  const inputsCount = ['User Prompt', 'Upload Image', 'Upload Video'].filter(matches).length;
  const textCount = ['Gemini 3 Pro', 'Gemini 2.5 Flash', 'Gemini Flash Lite', 'Prompt Expert'].filter(matches).length;
  const imageCount = ['Nano Banana', 'Nano Banana Pro'].filter(matches).length;
  const outputsCount = ['Image Viewer', 'Video Viewer', 'Message Output'].filter(matches).length;
  const agentsCount = ['Claude AI', 'Deepseek', 'OpenAI', 'Mistral AI'].filter(matches).length;
  return (
    <aside className="w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-xl z-20 relative transition-colors duration-300">
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
      <div className="p-5 overflow-y-auto flex-1 custom-scrollbar overflow-x-hidden">
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
          <div className="flex items-center justify-between px-1 mb-2 cursor-pointer" onClick={() => setInputsOpen(v => !v)}>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ChevronDown size={14} className={`${inputsOpen ? '' : 'rotate-180'} transition-transform`} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">Inputs</h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{inputsCount}</span>
          </div>
          <Collapsible open={inputsOpen}>
            {(!searchTerm || matches('User Prompt')) && (
              <SidebarItem type={NodeType.PROMPT_INPUT} icon={Type} label="User Prompt" colorClass="bg-blue-500"/>
            )}
            {(!searchTerm || matches('Upload Image')) && (
              <SidebarItem type={NodeType.IMAGE_UPLOAD} icon={Upload} label="Upload Image" colorClass="bg-slate-500"/>
            )}
            {(!searchTerm || matches('Upload Video')) && (
              <SidebarItem type={NodeType.VIDEO_UPLOAD} icon={Video} label="Upload Video" colorClass="bg-slate-500"/>
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
              <SidebarItem type={NodeType.GEMINI_3_PRO} iconSrc={GEMINI_LOGO} label="Gemini 3 Pro" colorClass="bg-indigo-500" />
            )}
            {(!searchTerm || matches('Gemini 2.5 Flash')) && (
              <SidebarItem type={NodeType.GEMINI_2_5_FLASH} iconSrc={GEMINI_LOGO} label="Gemini 2.5 Flash" colorClass="bg-cyan-500" />
            )}
            {(!searchTerm || matches('Gemini Flash Lite')) && (
              <SidebarItem type={NodeType.GEMINI_FLASH_LITE} iconSrc={GEMINI_LOGO} label="Gemini Flash Lite" colorClass="bg-teal-500" />
            )}
            {(!searchTerm || matches('Prompt Expert')) && (
              <SidebarItem type={NodeType.PROMPT_ENHANCER} iconSrc={GEMINI_LOGO} label="Prompt Expert" colorClass="bg-purple-500" />
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
              <SidebarItem type={NodeType.NANO_BANANA} iconSrc={GEMINI_LOGO} label="Nano Banana" colorClass="bg-amber-500" />
            )}
            {(!searchTerm || matches('Nano Banana Pro')) && (
              <SidebarItem type={NodeType.NANO_BANANA_PRO} iconSrc={GEMINI_LOGO} label="Nano Banana Pro" colorClass="bg-rose-500" />
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
              <SidebarItem type={NodeType.CLAUDE_AGENT} iconSrc={'/assets/logos/claude-ai.svg'} label="Claude AI" colorClass="bg-slate-500" />
            )}
            {(!searchTerm || matches('Deepseek')) && (
              <SidebarItem type={NodeType.DEEPSEEK_AGENT} iconSrc={'/assets/logos/deepseek.svg'} label="Deepseek" colorClass="bg-slate-500" />
            )}
            {(!searchTerm || matches('OpenAI')) && (
              <SidebarItem type={NodeType.OPENAI_AGENT} iconSrc={'/assets/logos/openai.svg'} label="OpenAI" colorClass="bg-slate-500" />
            )}
            {(!searchTerm || matches('Mistral AI')) && (
              <SidebarItem type={NodeType.MISTRAL_AGENT} iconSrc={'/assets/logos/mistral-ai.svg'} label="Mistral AI" colorClass="bg-slate-500" />
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
              <SidebarItem type={NodeType.IMAGE_DISPLAY} icon={Eye} label="Image Viewer" colorClass="bg-emerald-500" />
            )}
            {(!searchTerm || matches('Video Viewer')) && (
              <SidebarItem type={NodeType.VIDEO_DISPLAY} icon={Video} label="Video Viewer" colorClass="bg-emerald-500" />
            )}
            {(!searchTerm || matches('Message Output')) && (
              <SidebarItem type={NodeType.MESSAGE_OUTPUT} icon={Type} label="Message Output" colorClass="bg-emerald-500" />
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
