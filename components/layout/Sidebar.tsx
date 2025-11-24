import React from 'react';
import { Zap, Layout, Type, Brain, ZapIcon, Feather, Bot, Sparkles, Star, Eye, GripVertical, Upload } from 'lucide-react';
import { NodeType } from '../../types';

interface SidebarItemProps {
  type: NodeType;
  icon: any;
  label: string;
  colorClass: string;
  subLabel?: string;
}

const SidebarItem = ({ type, icon: Icon, label, colorClass, subLabel }: SidebarItemProps) => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className="group relative flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-grab hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-500/50 transition-all duration-200 mb-3 active:scale-95"
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      <div className={`p-2.5 rounded-lg ${colorClass} text-white shadow-sm group-hover:scale-105 transition-transform`}>
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block leading-tight">{label}</span>
        {subLabel && <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{subLabel}</span>}
      </div>
      <div className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={16} />
      </div>
    </div>
  );
};

export const Sidebar = () => {
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
        
        <div className="mb-8">
          <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Inputs</h3>
          <SidebarItem type={NodeType.PROMPT_INPUT} icon={Type} label="User Prompt" colorClass="bg-blue-500" subLabel="Start here"/>
          <SidebarItem type={NodeType.IMAGE_UPLOAD} icon={Upload} label="Upload Image" colorClass="bg-slate-500" subLabel="Image Input"/>
        </div>

        <div className="mb-8">
          <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Text Agents</h3>
          <SidebarItem type={NodeType.GEMINI_3_PRO} icon={Brain} label="Gemini 3 Pro" colorClass="bg-indigo-500" subLabel="High Intelligence" />
          <SidebarItem type={NodeType.GEMINI_2_5_FLASH} icon={ZapIcon} label="Gemini 2.5 Flash" colorClass="bg-cyan-500" subLabel="Fast & Balanced" />
          <SidebarItem type={NodeType.GEMINI_FLASH_LITE} icon={Feather} label="Gemini Flash Lite" colorClass="bg-teal-500" subLabel="Ultra Fast / Eco" />
          <SidebarItem type={NodeType.PROMPT_ENHANCER} icon={Bot} label="Prompt Expert" colorClass="bg-purple-500" subLabel="Optimizes prompts" />
        </div>

         <div className="mb-8">
          <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Image Generation</h3>
          <SidebarItem type={NodeType.NANO_BANANA} icon={Sparkles} label="Nano Banana" colorClass="bg-amber-500" subLabel="Standard Generation" />
          <SidebarItem type={NodeType.NANO_BANANA_PRO} icon={Star} label="Nano Banana Pro" colorClass="bg-rose-500" subLabel="HD Generation (2K)" />
        </div>

        <div className="mb-6">
          <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Outputs</h3>
          <SidebarItem type={NodeType.IMAGE_DISPLAY} icon={Eye} label="Image Viewer" colorClass="bg-emerald-500" subLabel="Display Result"/>
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