import React, { memo, useCallback } from 'react';
import { NodeProps, useReactFlow } from 'reactflow';
import { Type, Eye, Image as ImageIcon, Settings2, Server, Cpu, Key, Lock, Upload } from 'lucide-react';

import { NodeContainer } from './nodes/NodeContainer';
import { StatusBadge, LabelArea } from './nodes/NodeComponents';
import { TEXT_MODELS, PROVIDERS, NODE_CONFIGS } from '../config';
import { NodeType } from '../types';

// 1. Prompt Input Node
export const PromptInputNode = memo(({ id, type, data, selected }: NodeProps) => {
  const isError = data.status === 'error';
  const textAreaClasses = isError
    ? "w-full text-xs p-2 border border-red-500 bg-red-50 dark:bg-red-900/20 rounded-md focus:outline-none focus:ring-1 focus:ring-red-200 resize-none h-20 text-slate-700 dark:text-slate-200 font-medium placeholder-red-300 transition-all"
    : "nodrag w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-20 text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-800 transition-all placeholder-slate-400 dark:placeholder-slate-500";

  return (
    <NodeContainer 
      nodeId={id} nodeType={type} selected={selected} title="User Input" icon={Type} color="blue" handleLeft={false}
      tooltip="Bloco inicial para entrada de texto. Digite aqui o prompt que será enviado para os agentes de IA."
    >
      <LabelArea label="Prompt Inicial">
        <textarea
          className={textAreaClasses}
          placeholder={isError ? "Este campo é obrigatório!" : "Digite sua ideia aqui..."}
          value={data.value}
          onChange={(evt) => data.onChange && data.onChange(evt.target.value)}
        />
        {isError && <span className="text-[9px] text-red-500 font-bold ml-1 animate-pulse">Preenchimento obrigatório</span>}
      </LabelArea>
      <div className="flex justify-end mt-1"><StatusBadge status={data.status} /></div>
    </NodeContainer>
  );
});

// 2. Image Upload Node
export const ImageUploadNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.IMAGE_UPLOAD];

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setNodes((nodes) => nodes.map((n) => {
                if (n.id === id) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            value: result, // Store base64 here
                            imageUrl: result, // For preview
                            status: 'completed'
                        }
                    };
                }
                return n;
            }));
        };
        reader.readAsDataURL(file);
    }
  }, [id, setNodes]);

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip} handleLeft={false}>
      <div className="flex flex-col gap-2">
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative overflow-hidden group">
            {data.imageUrl ? (
                <>
                  <img src={data.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Upload className="text-white w-6 h-6" />
                  </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-[9px] text-slate-500 font-medium">Click to upload</p>
                </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
        
        {data.imageUrl ? (
             <div className="text-[9px] text-green-600 dark:text-green-400 font-medium text-center truncate px-2">
                Imagem carregada
             </div>
        ) : (
            <div className="text-[9px] text-slate-400 text-center px-2">
               Suporta JPG, PNG
            </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Out: Image (B64)</span>
         <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});

// 3. Generic LLM Node
export const TextGenNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.GEMINI_2_5_FLASH];

  const currentModel = data.model || config.defaultModel;
  const currentProvider = data.provider || 'google';
  const currentSystemMessage = data.systemMessage || '';

  const updateNode = useCallback((field: string, value: string) => {
    setNodes((nodes) => nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n));
  }, [id, setNodes]);

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip}>
      <div className="flex flex-col gap-2 mb-3">
        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 border-b border-slate-200 dark:border-slate-700 pb-1">
                <Settings2 size={10} /> <span className="text-[9px] font-bold uppercase">Configurações do Modelo</span>
            </div>
            {/* Provider */}
            <div className="grid grid-cols-3 gap-1 items-center">
                 <label className="text-[9px] text-slate-400 font-semibold flex items-center gap-1"><Server size={8}/> Provider</label>
                 <select className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none" value={currentProvider} onChange={(e) => updateNode('provider', e.target.value)}>
                    {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
            </div>
            {/* Model Name */}
            <div className="grid grid-cols-3 gap-1 items-center">
                 <label className="text-[9px] text-slate-400 font-semibold flex items-center gap-1"><Cpu size={8}/> Model</label>
                 <select className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none" value={currentModel} onChange={(e) => updateNode('model', e.target.value)}>
                    {TEXT_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
            </div>
            {/* API Key */}
            <div className="grid grid-cols-3 gap-1 items-center relative group/key">
                 <label className="text-[9px] text-slate-400 font-semibold flex items-center gap-1"><Key size={8}/> API Key</label>
                 <div className="col-span-2 relative">
                    <input type="password" disabled value="SYSTEM_ENV_KEY_AUTO_INJECTED" className="w-full text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 cursor-not-allowed select-none"/>
                    <Lock size={10} className="absolute right-2 top-1.5 text-slate-400 dark:text-slate-500" />
                 </div>
            </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700">
             <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
             <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Input do Nó Anterior</span>
        </div>

        <LabelArea label="System Message">
             <textarea className="nodrag w-full text-[10px] p-2 border border-slate-200 dark:border-slate-600 rounded-md focus:border-blue-500 outline-none resize-none h-16 text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-900 leading-tight placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Ex: Você é um assistente criativo..." value={currentSystemMessage} onChange={(e) => updateNode('systemMessage', e.target.value)} />
        </LabelArea>
      </div>
      
      {data.value ? (
        <LabelArea label="Resultado Texto">
           <div className={`bg-white dark:bg-slate-900 border border-${config.color}-100 dark:border-${config.color}-900 p-2 rounded-md text-[11px] text-slate-600 dark:text-slate-300 max-h-24 overflow-y-auto leading-relaxed custom-scrollbar`}>{data.value}</div>
        </LabelArea>
      ) : (
        <div className="text-center p-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-md mt-2"><span className="text-[10px] text-slate-400 dark:text-slate-500">Aguardando entrada...</span></div>
      )}
      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Output: String</span>
         <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});

// 4. Image Generator Node
export const ImageGenNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.NANO_BANANA];
  const isPro = type === NodeType.NANO_BANANA_PRO;

  const updateConfig = useCallback((field: 'aspectRatio' | 'resolution', value: string) => {
    setNodes((nodes) => nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n));
  }, [id, setNodes]);

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip}>
       <div className="mb-2">
        <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border mb-2 ${isPro ? 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/30 dark:border-rose-900 dark:text-rose-300' : 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/30 dark:border-amber-900 dark:text-amber-300'}`}>
           <Cpu size={10} /><span className="font-mono">{config.modelName}</span>
        </div>
      </div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 px-1">{config.desc}</div>

      <div className="space-y-2 mb-2 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
         <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-1"><Settings2 size={10} /><span className="text-[10px] font-bold uppercase">Configurações</span></div>
         <div className="flex flex-col gap-1">
           <label className="text-[9px] text-slate-400 font-semibold">Aspect Ratio</label>
           <select className="nodrag w-full text-[10px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none cursor-pointer" value={data.aspectRatio || '1:1'} onChange={(e) => updateConfig('aspectRatio', e.target.value)}>
             <option value="1:1">Square (1:1)</option>
             <option value="16:9">Landscape (16:9)</option>
             <option value="9:16">Portrait (9:16)</option>
             <option value="4:3">Standard (4:3)</option>
             <option value="3:4">Portrait (3:4)</option>
           </select>
         </div>
         {isPro && (
           <div className="flex flex-col gap-1">
             <label className="text-[9px] text-slate-400 font-semibold">Resolução</label>
             <select className="nodrag w-full text-[10px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none cursor-pointer" value={data.resolution || '1K'} onChange={(e) => updateConfig('resolution', e.target.value)}>
               <option value="1K">Standard (1K)</option>
               <option value="2K">High Res (2K)</option>
             </select>
           </div>
         )}
      </div>
      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Output: Image</span>
         <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});

// 5. Output Display Node
export const OutputNode = memo(({ id, type, data, selected }: NodeProps) => {
  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title="Canvas View" icon={Eye} color="green" handleRight={false} tooltip="Visualizador final.">
      <div className="bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden min-h-[180px] flex items-center justify-center border border-slate-200 dark:border-slate-700 relative group">
        {data.imageUrl ? (
          <>
            <img src={data.imageUrl} alt="Result" className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <a href={data.imageUrl} download="generated.png" className="bg-white text-slate-800 px-3 py-1 rounded-full text-xs font-bold hover:bg-orange-500 hover:text-white transition-colors">Baixar PNG</a>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400"><ImageIcon size={24} strokeWidth={1.5} /><span className="text-[10px]">Sem imagem</span></div>
        )}
      </div>
       <div className="flex justify-end mt-2"><StatusBadge status={data.imageUrl ? 'completed' : 'idle'} /></div>
    </NodeContainer>
  );
});