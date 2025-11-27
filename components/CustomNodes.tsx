import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { NodeProps, useReactFlow, Handle, Position } from 'reactflow';
import { Type, Eye, Image as ImageIcon, Settings2, Server, Cpu, Key, Lock, Upload, Video, Plus, Minus, FileText, FileCode, Copy, Play } from 'lucide-react';

import { NodeContainer } from './nodes/NodeContainer';
// serviços pesados são carregados sob demanda para reduzir o bundle inicial
import { StatusBadge, LabelArea } from './nodes/NodeComponents';
import { TEXT_MODELS, PROVIDERS, NODE_CONFIGS, OPENAI_MODELS, ANTHROPIC_MODELS, DEEPSEEK_MODELS, MISTRAL_MODELS, AGENT_PROVIDER_MAP, HUGGINGFACE_MODELS, KIMI_MODELS, GROK_MODELS } from '../config';
import { NodeType, NodeData } from '../types';
import { useTheme } from '../context/ThemeContext';

// 1. Prompt Input Node
/**
 * Nó de entrada de texto do usuário.
 * Renderiza textarea e publica o valor para nós seguintes.
 */
export const PromptInputNode = memo(({ id, type, data, selected }: NodeProps) => {
  const isError = data.status === 'error';
  const textAreaClasses = isError
    ? "w-full text-xs p-2 border border-red-500 bg-red-50 dark:bg-red-900/20 rounded-md focus:outline-none focus:ring-1 focus:ring-red-200 resize-none h-20 text-slate-700 dark:text-slate-200 font-medium placeholder-red-300 transition-all"
    : "nodrag w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-20 text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-800 transition-all placeholder-slate-400 dark:placeholder-slate-500";

  return (
    <NodeContainer 
      nodeId={id} nodeType={type} selected={selected} title="User Input" icon={Type} color="blue"
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

// 0. Start Node
/**
 * Nó inicial do fluxo.
 * Sem conexões de entrada; expõe JSON de inicialização como saída.
 */
export const StartNode = memo(({ id, type, data, selected }: NodeProps) => {
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.START];
  const executionId = String(data.executionId || '');
  const activatedAt = String(data.activatedAt || '');

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={Play} color={config.color} tooltip={config.tooltip} handleLeft={false}>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700 mb-2">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Nó Inicial</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="text-[10px] text-slate-500 dark:text-slate-400">Execution ID:</div>
        <div className="text-[10px] text-slate-700 dark:text-slate-200 truncate">{executionId || '-'}</div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400">Ativado em:</div>
        <div className="text-[10px] text-slate-700 dark:text-slate-200 truncate">{activatedAt || '-'}</div>
      </div>
      <div className="flex justify-end items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
        <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});

// 2. Image Upload Node
/**
 * Nó de upload de imagem.
 * Captura URL de imagem e expõe como saída.
 */
export const ImageUploadNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.IMAGE_UPLOAD];

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const img = new Image();
            img.onload = () => {
                const w = img.naturalWidth || 0;
                const h = img.naturalHeight || 0;
                const r = h === 0 ? 1 : w / h;
                const candidates = [
                  { key: '1:1', val: 1 },
                  { key: '16:9', val: 16 / 9 },
                  { key: '9:16', val: 9 / 16 },
                  { key: '4:3', val: 4 / 3 },
                  { key: '3:4', val: 3 / 4 },
                ];
                let closest = '1:1';
                let best = Number.MAX_VALUE;
                for (const c of candidates) {
                  const diff = Math.abs(r - c.val);
                  if (diff < best) { best = diff; closest = c.key; }
                }
                setNodes((nodes) => nodes.map((n) => {
                    if (n.id === id) {
                        return {
                            ...n,
                            data: {
                                ...n.data,
                                value: result,
                                imageUrl: result,
                                imageWidth: w,
                                imageHeight: h,
                                aspectRatio: closest,
                                status: 'completed'
                            }
                        };
                    }
                    return n;
                }));
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    }
  }, [id, setNodes]);

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip} iconSrc={config.iconSrc}>
      <div className="flex flex-col gap-2">
        <label
          className={`flex flex-col items-center justify-center w-full border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative overflow-hidden group ${data.imageUrl ? '' : 'h-24'}`}
          style={data.imageUrl && data.imageWidth && data.imageHeight ? { aspectRatio: `${data.imageWidth}/${data.imageHeight}` } : undefined}
        >
            {data.imageUrl ? (
                <>
                  <img src={data.imageUrl} alt="Preview" className="w-full h-full object-contain" loading="lazy" decoding="async" />
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
                {data.imageWidth && data.imageHeight ? `${data.imageWidth}×${data.imageHeight}` : 'Imagem carregada'}
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

// 2b. Video Upload Node
/**
 * Nó de upload de vídeo.
 * Captura URL de vídeo e expõe como saída.
 */
export const VideoUploadNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.VIDEO_UPLOAD];

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const readB64 = () => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });

        const readMeta = () => new Promise<{ width: number; height: number; closest: string }>((resolve) => {
          const url = URL.createObjectURL(file);
          const vid = document.createElement('video');
          vid.preload = 'metadata';
          vid.src = url;
          const candidates: { key: string; val: number }[] = [
            { key: '1:1', val: 1 },
            { key: '16:9', val: 16 / 9 },
            { key: '9:16', val: 9 / 16 },
            { key: '4:3', val: 4 / 3 },
            { key: '3:4', val: 3 / 4 },
            { key: '21:9', val: 21 / 9 },
            { key: '3:2', val: 3 / 2 },
            { key: '2:3', val: 2 / 3 },
            { key: '5:4', val: 5 / 4 },
            { key: '4:5', val: 4 / 5 },
          ];
          vid.onloadedmetadata = () => {
            const w = vid.videoWidth || 0;
            const h = vid.videoHeight || 0;
            URL.revokeObjectURL(url);
            const r = h === 0 ? 1 : w / h;
            let closest = '1:1';
            let best = Number.MAX_VALUE;
            for (const c of candidates) {
              const diff = Math.abs(r - c.val);
              if (diff < best) { best = diff; closest = c.key; }
            }
            resolve({ width: w, height: h, closest });
          };
          vid.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({ width: 0, height: 0, closest: '1:1' });
          };
        });

        Promise.all([readMeta(), readB64()]).then(([meta, b64]) => {
          setNodes((nodes) => nodes.map((n) => n.id === id ? {
            ...n,
            data: {
              ...n.data,
              value: b64,
              videoUrl: b64,
              videoWidth: meta.width,
              videoHeight: meta.height,
              aspectRatio: meta.closest,
              status: 'completed'
            }
          } : n));
        });
    }
  }, [id, setNodes]);

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip}>
      <div className="flex flex-col gap-2">
        <label
          className={`flex flex-col items-center justify-center w-full border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative overflow-hidden group ${data.videoUrl ? '' : 'h-24'}`}
          style={data.videoWidth && data.videoHeight ? { aspectRatio: `${data.videoWidth}/${data.videoHeight}` } : undefined}
        >
            {data.videoUrl ? (
                <>
                  <video src={data.videoUrl} className="w-full h-full object-contain" controls preload="metadata" playsInline />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Upload className="text-white w-6 h-6" />
                  </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Video className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-[9px] text-slate-500 font-medium">Click to upload</p>
                </div>
            )}
            <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
        </label>
        {data.videoUrl ? (
             <div className="text-[9px] text-green-600 dark:text-green-400 font-medium text-center truncate px-2">
                {data.videoWidth && data.videoHeight ? `${data.videoWidth}×${data.videoHeight} · ${data.aspectRatio}` : 'Vídeo carregado'}
             </div>
        ) : (
            <div className="text-[9px] text-slate-400 text-center px-2">
               Suporta MP4, WebM
            </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Out: Video (B64)</span>
         <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});

// 2c. XML Upload Node
/**
 * Nó de upload de XML.
 */
export const XmlUploadNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.XML_UPLOAD];

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const text = String(reader.result || '');
        setNodes((nodes) => nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, value: text, xmlContent: text, xmlName: file.name, status: 'completed' } } : n));
      };
      reader.readAsText(file, 'utf-8');
    }
  }, [id, setNodes]);

  const content = String(data.xmlContent || '');
  const snippet = content.slice(0, 280);

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={FileCode} color={config.color} tooltip={config.tooltip}>
      <div className="flex flex-col gap-2">
        <label className={`flex flex-col items-center justify-center w-full border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative overflow-hidden group h-24`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileCode className="w-6 h-6 text-slate-400 mb-1" />
            <p className="text-[9px] text-slate-500 font-medium">Click to upload</p>
          </div>
          <input type="file" className="hidden" accept=".xml,text/xml,application/xml" onChange={handleFileChange} />
        </label>
        {content ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-md text-[10px] text-slate-700 dark:text-slate-300 max-h-32 overflow-y-auto leading-relaxed custom-scrollbar">
            <div className="text-[9px] text-slate-400 mb-1">{data.xmlName || 'XML'}</div>
            <pre className="whitespace-pre-wrap break-words">{snippet}{content.length > snippet.length ? '…' : ''}</pre>
          </div>
        ) : (
          <div className="text-[9px] text-slate-400 text-center px-2">Suporta XML</div>
        )}
      </div>
      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Out: String (XML)</span>
         <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});

// 2d. PDF Upload Node
/**
 * Nó de upload de PDF.
 */
export const PdfUploadNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.PDF_UPLOAD];

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNodes((nodes) => nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, value: result, pdfUrl: result, pdfName: file.name, status: 'completed' } } : n));
      };
      reader.readAsDataURL(file);
    }
  }, [id, setNodes]);

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={FileText} color={config.color} tooltip={config.tooltip}>
      <div className="flex flex-col gap-2">
        <label className={`flex flex-col items-center justify-center w-full border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative overflow-hidden group h-24`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileText className="w-6 h-6 text-slate-400 mb-1" />
            <p className="text-[9px] text-slate-500 font-medium">Click to upload</p>
          </div>
          <input type="file" className="hidden" accept="application/pdf,.pdf" onChange={handleFileChange} />
        </label>
        {data.pdfUrl ? (
          <div className="text-[9px] text-green-600 dark:text-green-400 font-medium text-center truncate px-2">
             {data.pdfName || 'PDF carregado'}
          </div>
        ) : (
          <div className="text-[9px] text-slate-400 text-center px-2">Suporta PDF</div>
        )}
      </div>
      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Out: PDF (B64)</span>
         <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});

// 3. Generic LLM Node
/**
 * Nó de agentes de texto/LLM.
 * Suporta seleção de modelo, provedor e system message.
 */
export const TextGenNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.OPENAI_AGENT];
  const isExternalAgent = type === NodeType.CLAUDE_AGENT || type === NodeType.DEEPSEEK_AGENT || type === NodeType.OPENAI_AGENT || type === NodeType.MISTRAL_AGENT || type === NodeType.HUGGING_FACE_AGENT || type === NodeType.KIMI_AGENT || type === NodeType.GROK_AGENT;
  const isGeminiAgent = type === NodeType.GEMINI_AGENT;
  const fixedProvider = AGENT_PROVIDER_MAP[type as string] || 'google';

  const modelsForType = () => {
    if (type === NodeType.OPENAI_AGENT) return OPENAI_MODELS;
    if (type === NodeType.CLAUDE_AGENT) return ANTHROPIC_MODELS;
    if (type === NodeType.DEEPSEEK_AGENT) return DEEPSEEK_MODELS;
    if (type === NodeType.MISTRAL_AGENT) return MISTRAL_MODELS;
    if (type === NodeType.HUGGING_FACE_AGENT) return HUGGINGFACE_MODELS;
    if (type === NodeType.KIMI_AGENT) return KIMI_MODELS;
    if (type === NodeType.GROK_AGENT) return GROK_MODELS;
    return TEXT_MODELS;
  };

  const currentModel = data.model || config.defaultModel;
  const currentProvider = data.provider || 'google';
  const currentSystemMessage = data.systemMessage || '';
  const currentTemperature = typeof data.temperature === 'number' ? data.temperature : 0.7;
  const currentMaxTokens = typeof data.maxTokens === 'number' ? data.maxTokens : 1024;
  const currentTimeoutMs = typeof data.timeoutMs === 'number' ? data.timeoutMs : 10000;
  const currentCacheEnabled = typeof data.cacheEnabled === 'boolean' ? data.cacheEnabled : true;

  useEffect(() => {
    if (isGeminiAgent && currentProvider !== 'google') {
      setNodes((nodes) => nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, provider: 'google' } } : n));
    }
  }, [isGeminiAgent, currentProvider, id, setNodes]);

  type UpdateField = 'provider' | 'model' | 'apiKey' | 'systemMessage';
  const updateNode = useCallback((field: UpdateField, value: string) => {
    setNodes((nodes) => nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n));
  }, [id, setNodes]);
  const updateNumeric = useCallback((field: 'temperature' | 'maxTokens' | 'timeoutMs', value: number) => {
    setNodes((nodes) => nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n));
  }, [id, setNodes]);
  const updateBool = useCallback((field: 'cacheEnabled', value: boolean) => {
    setNodes((nodes) => nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n));
  }, [id, setNodes]);

  const modelOptions = modelsForType();
  const validModel = modelOptions.some((m) => m.id === currentModel) ? currentModel : (modelOptions[0]?.id || currentModel);

  useEffect(() => {
    if (isExternalAgent && currentProvider !== fixedProvider) {
      updateNode('provider', fixedProvider);
    }
    if (validModel !== currentModel) {
      updateNode('model', validModel);
    }
  }, [isExternalAgent, fixedProvider, currentProvider, currentModel, validModel, updateNode]);

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip} iconSrc={config.iconSrc} brandHex={config.brandHex} brandHeaderHex={config.brandHeaderHex}>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700 mb-3">
         <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
         <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Input do Nó Anterior</span>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 flex flex-col gap-2 mb-3">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 border-b border-slate-200 dark:border-slate-700 pb-1">
              <Settings2 size={10} /> <span className="text-[9px] font-bold uppercase">Configurações do Modelo</span>
          </div>
          {/* Provider */}
          <div className="grid grid-cols-3 gap-1 items-center">
               <label className="text-[9px] text-slate-400 font-semibold flex items-center gap-1"><Server size={8}/> Model Provider</label>
              {(isExternalAgent || isGeminiAgent) ? (
                 <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none" value={fixedProvider} disabled />
              ) : (
                 <select className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none" value={currentProvider} onChange={(e) => updateNode('provider', e.target.value)}>
                    {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                 </select>
              )}
          </div>
          {/* Model Name */}
          <div className="grid grid-cols-3 gap-1 items-center">
               <label className="text-[9px] text-slate-400 font-semibold flex items-center gap-1"><Cpu size={8}/> Model Name</label>
               <select className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none" value={validModel} onChange={(e) => updateNode('model', e.target.value)}>
                  {modelOptions.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
               </select>
          </div>
          {/* API Key */}
          <div className="grid grid-cols-3 gap-1 items-center relative">
               <label className="text-[9px] text-slate-400 font-semibold flex items-center gap-1"><Key size={8}/> API Key</label>
               <div className="col-span-2 relative">
                  <input type="password" value={data.apiKey || ''} onChange={(e) => updateNode('apiKey', e.target.value)} className="w-full text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200"/>
                  <Lock size={10} className="absolute right-2 top-1.5 text-slate-400 dark:text-slate-500" />
               </div>
          </div>
          {isGeminiAgent && (
            <div className="grid grid-cols-3 gap-1 items-center">
              <label className="text-[9px] text-slate-400 font-semibold">Temperature</label>
              <input type="number" min={0} max={2} step={0.1} value={currentTemperature} onChange={(e) => updateNumeric('temperature', Number(e.target.value))} className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
            </div>
          )}
          {isGeminiAgent && (
            <div className="grid grid-cols-3 gap-1 items-center">
              <label className="text-[9px] text-slate-400 font-semibold">Max Tokens</label>
              <input type="number" min={1} max={8192} step={1} value={currentMaxTokens} onChange={(e) => updateNumeric('maxTokens', Number(e.target.value))} className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
            </div>
          )}
          {isGeminiAgent && (
            <div className="grid grid-cols-3 gap-1 items-center">
              <label className="text-[9px] text-slate-400 font-semibold">Timeout (ms)</label>
              <input type="number" min={1000} max={60000} step={500} value={currentTimeoutMs} onChange={(e) => updateNumeric('timeoutMs', Number(e.target.value))} className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
            </div>
          )}
          {isGeminiAgent && (
            <div className="grid grid-cols-3 gap-1 items-center">
              <label className="text-[9px] text-slate-400 font-semibold">Cache</label>
              <div className="col-span-2">
                <input type="checkbox" checked={currentCacheEnabled} onChange={(e) => updateBool('cacheEnabled', e.target.checked)} />
              </div>
            </div>
          )}
      </div>

      <LabelArea label="System Message">
           <textarea className="nodrag w-full text-[10px] p-2 border border-slate-200 dark:border-slate-600 rounded-md focus:border-blue-500 outline-none resize-none h-16 text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-900 leading-tight placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Ex: Você é um assistente criativo..." value={currentSystemMessage} onChange={(e) => updateNode('systemMessage', e.target.value)} />
      </LabelArea>
      
      {data.value ? (
        <LabelArea label="Resultado Texto">
           <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-md text-[11px] text-slate-600 dark:text-slate-300 max-h-24 overflow-y-auto leading-relaxed custom-scrollbar`}>{data.value}</div>
        </LabelArea>
      ) : (
        <div className="text-center p-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-md mt-2"><span className="text-[10px] text-slate-400 dark:text-slate-500">Aguardando entrada...</span></div>
      )}
      {isGeminiAgent && Array.isArray(data.history) && data.history.length > 0 && (
        <LabelArea label="Histórico">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-md text-[10px] text-slate-600 dark:text-slate-300 max-h-24 overflow-y-auto leading-relaxed custom-scrollbar">
            {data.history.slice(-5).reverse().map((h, i) => (
              <div key={i} className="mb-1">
                <div className="font-mono text-[9px] text-slate-500">{new Date(h.ts).toLocaleTimeString()}</div>
                <div className="font-semibold">{h.prompt}</div>
                <div className="text-slate-500 truncate">{h.result}</div>
              </div>
            ))}
          </div>
        </LabelArea>
      )}
      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Output: String</span>
         <StatusBadge status={data.value ? 'completed' : data.status} />
      </div>
    </NodeContainer>
  );
});

// 4. Image Generator Node
/**
 * Nó de geração de imagem.
 * Configura aspecto e resolução e chama gerador.
 */
export const ImageGenNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.NANO_BANANA];
  const isPro = type === NodeType.NANO_BANANA_PRO;

  const updateConfig = useCallback((field: 'aspectRatio' | 'resolution', value: string) => {
    setNodes((nodes) => nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n));
  }, [id, setNodes]);

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip} iconSrc={config.iconSrc} brandHex={config.brandHex}>
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
          <select className="nodrag w-full text-[10px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none cursor-pointer" value={data.aspectRatio || (isPro ? 'Auto' : '1:1')} onChange={(e) => updateConfig('aspectRatio', e.target.value)}>
            {isPro ? (
              <>
                <option value="Auto">Auto</option>
                <option value="1:1">1:1</option>
                <option value="9:16">9:16</option>
                <option value="16:9">16:9</option>
                <option value="3:4">3:4</option>
                <option value="4:3">4:3</option>
                <option value="3:2">3:2</option>
                <option value="2:3">2:3</option>
                <option value="5:4">5:4</option>
                <option value="4:5">4:5</option>
                <option value="21:9">21:9</option>
              </>
            ) : (
              <>
                <option value="1:1">Square (1:1)</option>
                <option value="16:9">Landscape (16:9)</option>
                <option value="9:16">Portrait (9:16)</option>
                <option value="4:3">Standard (4:3)</option>
                <option value="3:4">Portrait (3:4)</option>
              </>
            )}
          </select>
         </div>
         {isPro && (
           <div className="flex flex-col gap-1">
             <label className="text-[9px] text-slate-400 font-semibold">Resolução</label>
            <select className="nodrag w-full text-[10px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none cursor-pointer" value={data.resolution || '1K'} onChange={(e) => updateConfig('resolution', e.target.value)}>
              <option value="1K">1k</option>
              <option value="2K">2k</option>
              <option value="4K">4k</option>
            </select>
           </div>
         )}
      </div>
      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Output: Image</span>
         <StatusBadge status={data.imageUrl ? 'completed' : data.status} />
      </div>
    </NodeContainer>
  );
});

// 5. Output Display Node
/**
 * Nó de visualização de imagem.
 */
export const OutputNode = memo(({ id, type, data, selected }: NodeProps) => {
  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title="Canvas View" icon={Eye} color="green" tooltip="Visualizador final.">
      <div className="bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden min-h-[180px] flex items-center justify-center border border-slate-200 dark:border-slate-700 relative group">
        {data.imageUrl ? (
          <>
            <img src={data.imageUrl} alt="Result" className="w-full h-auto object-contain" />
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

// 6. Message Output Node
/**
 * Nó de saída de mensagem textual.
 */
export const MessageOutputNode = memo(({ id, type, data, selected }: NodeProps) => {
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.MESSAGE_OUTPUT];
  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip}>
      {data.value ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-md text-[11px] text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto leading-relaxed custom-scrollbar">
          {data.value}
        </div>
      ) : (
        <div className="text-center p-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-md mt-2"><span className="text-[10px] text-slate-400 dark:text-slate-500">Sem mensagem</span></div>
      )}
      <div className="flex justify-end mt-2"><StatusBadge status={data.value ? 'completed' : 'idle'} /></div>
    </NodeContainer>
  );
});

// 7. Video Output Node
/**
 * Nó de visualização de vídeo.
 */
export const VideoOutputNode = memo(({ id, type, data, selected }: NodeProps) => {
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.VIDEO_DISPLAY];
  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip}>
      <div className="bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden min-h-[180px] flex items-center justify-center border border-slate-200 dark:border-slate-700 relative">
        {data.videoUrl ? (
          <video src={data.videoUrl} controls className="w-full h-auto object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400"><Video size={24} strokeWidth={1.5} /><span className="text-[10px]">Sem vídeo</span></div>
        )}
      </div>
      <div className="flex justify-end mt-2"><StatusBadge status={data.videoUrl ? 'completed' : 'idle'} /></div>
    </NodeContainer>
  );
});

// 8. Redis Node (Configurações e Operações)
/**
 * Nó de integração Redis/Upstash via REST.
 * Permite GET/SET/DEL com host/token.
 */
export const RedisNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.REDIS];

  type RedisField =
    | 'redisHost'
    | 'redisPort'
    | 'redisDb'
    | 'redisPassword'
    | 'redisAction'
    | 'redisKey'
    | 'redisValue';

  const updateNode = useCallback((field: RedisField, value: string) => {
    setNodes((nodes) => nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n)));
  }, [id, setNodes]);

  const currentAction = data.redisAction || 'GET';

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip} iconSrc={config.iconSrc}>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700 mb-3">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Input do Nó Anterior</span>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 flex flex-col gap-2 mb-3">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 border-b border-slate-200 dark:border-slate-700 pb-1">
          <Settings2 size={10} /> <span className="text-[9px] font-bold uppercase">Configurações de Conexão</span>
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Host</label>
          <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.redisHost || ''} onChange={(e) => updateNode('redisHost', e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Port</label>
          <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.redisPort || ''} onChange={(e) => updateNode('redisPort', e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">DB</label>
          <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.redisDb || ''} onChange={(e) => updateNode('redisDb', e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Password</label>
          <input type="password" className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.redisPassword || ''} onChange={(e) => updateNode('redisPassword', e.target.value)} />
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 flex flex-col gap-2 mb-2">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
          <Settings2 size={10} /> <span className="text-[9px] font-bold uppercase">Operação</span>
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Ação</label>
          <select className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={currentAction} onChange={(e) => updateNode('redisAction', e.target.value)}>
            <option value="GET">GET</option>
            <option value="SET">SET</option>
            <option value="DEL">DEL</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Key</label>
          <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.redisKey || ''} onChange={(e) => updateNode('redisKey', e.target.value)} />
        </div>
        {currentAction === 'SET' && (
          <div className="grid grid-cols-3 gap-1 items-center">
            <label className="text-[9px] text-slate-400 font-semibold">Value</label>
            <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.redisValue || ''} onChange={(e) => updateNode('redisValue', e.target.value)} />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
        <span className="text-[10px] text-slate-400 font-medium">Output: String/JSON</span>
        <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});

// 9. Supabase Node (Configuração e Operações)
/**
 * Nó de integração Supabase.
 * Permite operações select/insert/update/delete com payload JSON.
 */
export const SupabaseNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.SUPABASE];

  type SupaField =
    | 'supabaseUrl'
    | 'supabaseKey'
    | 'supabaseTable'
    | 'supabaseOperation'
    | 'supabasePayload';

  const updateNode = useCallback((field: SupaField, value: string) => {
    setNodes((nodes) => nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n)));
  }, [id, setNodes]);

  const currentOp = data.supabaseOperation || 'select';

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip} iconSrc={config.iconSrc} brandHex={config.brandHex} brandHeaderHex={config.brandHeaderHex}>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700 mb-3">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Input do Nó Anterior</span>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 flex flex-col gap-2 mb-3">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 border-b border-slate-200 dark:border-slate-700 pb-1">
          <Settings2 size={10} /> <span className="text-[9px] font-bold uppercase">Configurações do Projeto</span>
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">URL</label>
          <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.supabaseUrl || ''} onChange={(e) => updateNode('supabaseUrl', e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">API Key</label>
          <input type="password" className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.supabaseKey || ''} onChange={(e) => updateNode('supabaseKey', e.target.value)} />
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 flex flex-col gap-2 mb-2">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
          <Settings2 size={10} /> <span className="text-[9px] font-bold uppercase">Operação</span>
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Tabela</label>
          <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.supabaseTable || ''} onChange={(e) => updateNode('supabaseTable', e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Ação</label>
          <select className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={currentOp} onChange={(e) => updateNode('supabaseOperation', e.target.value)}>
            <option value="select">select</option>
            <option value="insert">insert</option>
            <option value="update">update</option>
            <option value="delete">delete</option>
          </select>
        </div>
        <LabelArea label="Payload/Query (JSON)">
          <textarea className="nodrag w-full text-[10px] p-2 border border-slate-200 dark:border-slate-600 rounded-md focus:border-blue-500 outline-none resize-none h-16 text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-900 leading-tight placeholder-slate-400 dark:placeholder-slate-500" placeholder='{"select":"*","where":{"id":{"eq":1}},"order":{"column":"id","desc":true},"limit":10}' value={data.supabasePayload || ''} onChange={(e) => updateNode('supabasePayload', e.target.value)} />
        </LabelArea>
      </div>

      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
        <span className="text-[10px] text-slate-400 font-medium">Output: String/JSON</span>
        <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});

// 10. Communication Node (Generic placeholder)
/**
 * Nó genérico de comunicação/integrations placeholder.
 */
export const CommunicationNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || {
    title: 'Communication', icon: Server, color: 'green', tooltip: '', iconSrc: undefined, brandHex: undefined, brandHeaderHex: undefined
  } as any;
  const isWhatsApp = type === NodeType.WHATSAPP;
  const isGmail = type === NodeType.GMAIL;
  const updateWhats = (field: 'whatsPhone' | 'whatsApiKey' | 'whatsEndpoint' | 'whatsProxyUrl', value: string) => {
    setNodes((nodes) => nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n)));
  };
  const updateGmail = (field: keyof NodeData, value: any) => {
    setNodes((nodes) => nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n)));
  };
  if (isWhatsApp && !data.onTestConnection) {
    const onTestConnection = async () => {
      const { createWhatsAppClient } = await import('../services/whatsappService');
      const client = createWhatsAppClient();
      const phone = String(data.whatsPhone || '');
      const apiKey = String(data.whatsApiKey || '');
      const endpoint = String(data.whatsEndpoint || '');
      const proxyUrl = String(data.whatsProxyUrl || '');
      const res = client.validateConfig({ phone, apiKey, endpoint, proxyUrl });
      if (!res.ok) {
        setNodes((nodes) => nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, whatsError: res.errors.join('; '), whatsStatus: '' } } : n)));
        return;
      }
      try {
        const r = await client.testConnection({ phone, apiKey, endpoint, proxyUrl });
        setNodes((nodes) => nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, whatsError: '', whatsStatus: `Conectado (${r.status})`, status: 'completed' } } : n)));
      } catch {
        setNodes((nodes) => nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, whatsError: 'Falha na conexão', whatsStatus: '', status: 'error' } } : n)));
      }
    };
    setNodes((nodes) => nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, onTestConnection } } : n)));
  }

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip} iconSrc={config.iconSrc} brandHex={config.brandHex} brandHeaderHex={config.brandHeaderHex}>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700 mb-3">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Input do Nó Anterior</span>
      </div>

      {isWhatsApp && (
        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 flex flex-col gap-2 mb-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <Settings2 size={10} /> <span className="text-[9px] font-bold uppercase">Configurações de Conexão</span>
          </div>
          <div className="grid grid-cols-3 gap-1 items-center">
            <label className="text-[9px] text-slate-400 font-semibold">Número</label>
            <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.whatsPhone || ''} onChange={(e) => updateWhats('whatsPhone', e.target.value)} placeholder="+5511999999999" />
          </div>
          <div className="grid grid-cols-3 gap-1 items-center">
            <label className="text-[9px] text-slate-400 font-semibold">API Key</label>
            <input type="password" className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.whatsApiKey || ''} onChange={(e) => updateWhats('whatsApiKey', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-1 items-center">
            <label className="text-[9px] text-slate-400 font-semibold">Endpoint</label>
            <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.whatsEndpoint || ''} onChange={(e) => updateWhats('whatsEndpoint', e.target.value)} placeholder="https://api.exemplo.com" />
          </div>
          <div className="grid grid-cols-3 gap-1 items-center">
            <label className="text-[9px] text-slate-400 font-semibold">Proxy</label>
            <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.whatsProxyUrl || ''} onChange={(e) => updateWhats('whatsProxyUrl', e.target.value)} placeholder="http://user:pass@host:port" />
          </div>
          <div className="flex justify-end items-center gap-2">
            <button className="px-2 py-1 rounded text-[10px] bg-emerald-600 text-white font-bold hover:bg-emerald-700" onClick={() => data.onTestConnection && data.onTestConnection()}>Testar conexão</button>
            {data.whatsError && <span className="text-[10px] text-rose-600">{data.whatsError}</span>}
            {data.whatsStatus && <span className="text-[10px] text-emerald-600">{data.whatsStatus}</span>}
          </div>
        </div>
      )}
      {isGmail && (
        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 flex flex-col gap-2 mb-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <Settings2 size={10} /> <span className="text-[9px] font-bold uppercase">Gmail</span>
          </div>
          <div className="grid grid-cols-3 gap-1 items-center">
            <label className="text-[9px] text-slate-400 font-semibold">Operação</label>
            <select className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.gmailOperation || ''} onChange={(e) => updateGmail('gmailOperation', e.target.value as any)}>
              <option value="">Selecione...</option>
              <option value="send">Enviar e-mail</option>
              <option value="read">Ler e-mail</option>
              <option value="search">Pesquisar e-mail</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-1 items-center">
            <label className="text-[9px] text-slate-400 font-semibold">Client ID</label>
            <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.gmailClientId || ''} onChange={(e) => updateGmail('gmailClientId', e.target.value)} placeholder="Google OAuth Client ID" />
          </div>
          <div className="grid grid-cols-3 gap-1 items-center">
            <label className="text-[9px] text-slate-400 font-semibold">Redirect URI</label>
            <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.gmailRedirectUri || ''} onChange={(e) => updateGmail('gmailRedirectUri', e.target.value)} placeholder="https://seuapp.com/" />
          </div>
          <div className="grid grid-cols-3 gap-1 items-center">
            <label className="text-[9px] text-slate-400 font-semibold">Scope</label>
            <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.gmailScope || 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send'} onChange={(e) => updateGmail('gmailScope', e.target.value)} />
          </div>
          <div className="flex justify-center items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-[11px] bg-[#1A73E8] hover:bg-[#1669C1] text-white font-bold shadow disabled:opacity-60 dark:bg-[#4285F4] dark:hover:bg-[#2F66D0]" onClick={async () => {
              updateGmail('gmailIsLoading', true);
              updateGmail('gmailError', '');
              try {
                const op = data.gmailOperation;
                if (!op || !['send','read','search'].includes(op)) {
                  updateGmail('gmailError', 'Selecione uma operação');
                  updateGmail('gmailIsLoading', false);
                  return;
                }
            const { pkceCreate, buildAuthUrl, exchangeCode } = await import('../services/gmailService');
            const { verifier, challenge } = await pkceCreate();
                const state = `gmail-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
                sessionStorage.setItem('gmail_pkce_verifier', verifier);
                sessionStorage.setItem('gmail_auth_state', state);
                const redirect = (data.gmailRedirectUri || window.location.origin) + (data.gmailRedirectUri?.includes('?') ? '&' : '?') + 'oauth=google';
            const url = buildAuthUrl({ clientId: String(data.gmailClientId || ''), redirectUri: redirect, scope: String(data.gmailScope || ''), state, codeChallenge: challenge });
                const popup = window.open(url, 'gmail_oauth', 'width=500,height=700');
                const handler = async (event: MessageEvent) => {
                  if (typeof event.data !== 'object' || !event.data) return;
                  if (event.data.type !== 'gmail_oauth') return;
                  if (event.data.state !== state) return;
                  window.removeEventListener('message', handler);
                  try {
                    const code = String(event.data.code || '');
                    const token = await exchangeCode({ clientId: String(data.gmailClientId || ''), code, redirectUri: redirect, codeVerifier: verifier });
                    updateGmail('gmailAccessToken', token.access_token);
                    updateGmail('gmailTokenType', token.token_type);
                    updateGmail('gmailTokenExpiry', Date.now() + (token.expires_in || 0) * 1000);
                    updateGmail('gmailStatus', 'Autenticado');
                  } catch {
                    updateGmail('gmailError', 'Falha na autenticação');
                  } finally {
                    updateGmail('gmailIsLoading', false);
                    if (popup) popup.close();
                  }
                };
                window.addEventListener('message', handler);
              } catch {
                updateGmail('gmailError', 'Erro ao iniciar OAuth');
                updateGmail('gmailIsLoading', false);
              }
            }} disabled={data.gmailIsLoading}>
              <img src="/assets/logos/gmail.svg" alt="Gmail" className="w-4 h-4" />
              <span>Continuar com Google</span>
            </button>
            {data.gmailIsLoading && <span className="text-[10px] text-slate-500">Carregando...</span>}
            {data.gmailError && <span className="text-[10px] text-rose-600">{data.gmailError}</span>}
            {data.gmailStatus && <span className="text-[10px] text-emerald-600">{data.gmailStatus}</span>}
          </div>
          {data.gmailOperation === 'send' && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="grid grid-cols-3 gap-1 items-center">
                <label className="text-[9px] text-slate-400 font-semibold">Destinatário</label>
                <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.gmailTo || ''} onChange={(e) => updateGmail('gmailTo', e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-1 items-center">
                <label className="text-[9px] text-slate-400 font-semibold">Assunto</label>
                <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.gmailSubject || ''} onChange={(e) => updateGmail('gmailSubject', e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-1 items-start">
                <label className="text-[9px] text-slate-400 font-semibold">Corpo</label>
                <textarea className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 h-20" value={data.gmailBody || ''} onChange={(e) => updateGmail('gmailBody', e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={!!data.gmailIsHtml} onChange={(e) => updateGmail('gmailIsHtml', e.target.checked)} />
                <span className="text-[9px] text-slate-500 dark:text-slate-400">Formato HTML</span>
              </div>
              <div className="grid grid-cols-3 gap-1 items-center">
                <label className="text-[9px] text-slate-400 font-semibold">Anexos</label>
                <input type="file" multiple className="nodrag col-span-2 text-[9px]" onChange={async (e) => {
                  const files: File[] = e.target.files ? Array.from(e.target.files) as File[] : [];
                  const items: Array<{ name: string; type: string; data: string }> = [];
                  for (const f of files) {
                    const buf = await f.arrayBuffer();
                    const bytes = new Uint8Array(buf);
                    let str = '';
                    for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
                    const b64 = btoa(str);
                    const b64url = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                    items.push({ name: f.name, type: f.type || 'application/octet-stream', data: b64url });
                  }
                  updateGmail('gmailAttachments', items);
                }} />
              </div>
              <div className="flex justify-end">
                <button className="px-2 py-1 rounded text-[10px] bg-orange-500 text-white font-bold hover:bg-orange-600" onClick={async () => {
                  if (!data.gmailAccessToken) { updateGmail('gmailError', 'Autentique com Google'); return; }
                  if (!data.gmailTo || !data.gmailSubject || !data.gmailBody) { updateGmail('gmailError', 'Preencha destinatário, assunto e corpo'); return; }
                  try {
                  const { gmailSendMessage } = await import('../services/gmailService');
                  const r = await gmailSendMessage(String(data.gmailAccessToken), String(data.gmailTo), String(data.gmailSubject), String(data.gmailBody), !!data.gmailIsHtml, data.gmailAttachments || []);
                    updateGmail('gmailStatus', `Email enviado (${r.id})`);
                    updateGmail('gmailError', '');
                  } catch {
                    updateGmail('gmailError', 'Falha ao enviar e-mail');
                  }
                }}>Enviar e-mail</button>
              </div>
            </div>
          )}
          {data.gmailOperation === 'read' && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="grid grid-cols-3 gap-1 items-center">
                <label className="text-[9px] text-slate-400 font-semibold">Caixa</label>
                <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.gmailLabel || 'INBOX'} onChange={(e) => updateGmail('gmailLabel', e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-1 items-center">
                <label className="text-[9px] text-slate-400 font-semibold">Remetente</label>
                <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.gmailFrom || ''} onChange={(e) => updateGmail('gmailFrom', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <input type="date" className="nodrag text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.gmailStartDate || ''} onChange={(e) => updateGmail('gmailStartDate', e.target.value)} />
                <input type="date" className="nodrag text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={data.gmailEndDate || ''} onChange={(e) => updateGmail('gmailEndDate', e.target.value)} />
              </div>
              <div className="flex justify-end">
                <button className="px-2 py-1 rounded text-[10px] bg-indigo-600 text-white font-bold hover:bg-indigo-700" onClick={async () => {
                  if (!data.gmailAccessToken) { updateGmail('gmailError', 'Autentique com Google'); return; }
                  const filters: string[] = [];
                  if (data.gmailLabel) filters.push(`label:${data.gmailLabel}`);
                  if (data.gmailFrom) filters.push(`from:${data.gmailFrom}`);
                  if (data.gmailStartDate) filters.push(`after:${data.gmailStartDate}`);
                  if (data.gmailEndDate) filters.push(`before:${data.gmailEndDate}`);
                  const q = filters.join(' ');
                  try {
                  const { gmailListMessages } = await import('../services/gmailService');
                  const r = await gmailListMessages(String(data.gmailAccessToken), q);
                    const msgs = Array.isArray(r.messages) ? r.messages : [];
                    updateGmail('gmailMessages', msgs);
                    updateGmail('gmailError', '');
                  } catch { updateGmail('gmailError', 'Falha ao listar e-mails'); }
                }}>Listar</button>
              </div>
              <div className="max-h-28 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700 rounded">
                {(data.gmailMessages || []).map((m: any) => (
                  <div key={m.id} className="px-2 py-1 text-[10px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={async () => {
                    try {
                      const { gmailGetMessage } = await import('../services/gmailService');
                      const full = await gmailGetMessage(String(data.gmailAccessToken), m.id);
                      updateGmail('gmailSelectedMessage', full);
                      updateGmail('gmailError', '');
                    } catch { updateGmail('gmailError', 'Falha ao carregar e-mail'); }
                  }}>{m.id}</div>
                ))}
              </div>
              {data.gmailSelectedMessage && (
                <div className="mt-2 text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 max-h-32 overflow-y-auto">
                  <pre className="whitespace-pre-wrap break-words">{JSON.stringify(data.gmailSelectedMessage, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
          {data.gmailOperation === 'search' && (
            <div className="flex flex-col gap-2 mt-2">
              <input className="nodrag text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" placeholder="Consulta avançada (from:, subject:, after:, before:)" value={data.gmailQuery || ''} onChange={(e) => updateGmail('gmailQuery', e.target.value)} />
              <div className="flex justify-end">
                <button className="px-2 py-1 rounded text-[10px] bg-indigo-600 text-white font-bold hover:bg-indigo-700" onClick={async () => {
                  if (!data.gmailAccessToken) { updateGmail('gmailError', 'Autentique com Google'); return; }
                  try {
                    const { gmailListMessages } = await import('../services/gmailService');
                    const r = await gmailListMessages(String(data.gmailAccessToken), String(data.gmailQuery || ''));
                    updateGmail('gmailMessages', Array.isArray(r.messages) ? r.messages : []);
                    updateGmail('gmailError', '');
                  } catch { updateGmail('gmailError', 'Falha na pesquisa'); }
                }}>Pesquisar</button>
              </div>
              <div className="max-h-28 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700 rounded">
                {(data.gmailMessages || []).map((m: any) => (
                  <div key={m.id} className="px-2 py-1 text-[10px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={async () => {
                    try { const { gmailGetMessage } = await import('../services/gmailService'); const full = await gmailGetMessage(String(data.gmailAccessToken), m.id); updateGmail('gmailSelectedMessage', full); } catch { updateGmail('gmailError', 'Falha ao carregar e-mail'); }
                  }}>{m.id}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {data.value ? (
        <div className="bg-white dark:bg-slate-900 border p-2 rounded-md text-[11px] text-slate-600 dark:text-slate-300 max-h-24 overflow-y-auto leading-relaxed custom-scrollbar" style={isWhatsApp && config.brandHex ? { borderColor: config.brandHex } : undefined}>{data.value}</div>
      ) : (
        <div className="text-center p-3 border border-dashed rounded-md mt-2" style={isWhatsApp && config.brandHex ? { borderColor: config.brandHex } : undefined}><span className="text-[10px] text-slate-400 dark:text-slate-500">Aguardando entrada...</span></div>
      )}

      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Output: String</span>
         <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});

/**
 * Nó de Webhook: ponto de entrada externo de HTTP.
 * Permite configurar método, path, content-type e payload de teste.
 */
export const WebhookNode = memo(({ id, type, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || { title: 'Webhook', icon: Server, color: 'teal', tooltip: '', iconSrc: undefined } as any;

  const updateNode = useCallback((field: 'webhookPath' | 'webhookMethod' | 'webhookSecret' | 'webhookContentType' | 'webhookPayload', value: string) => {
    setNodes((nodes) => nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n)));
  }, [id, setNodes]);

  const method = data.webhookMethod || 'POST';
  const path = (data.webhookPath || id).replace(/[^a-zA-Z0-9-_]/g, '');
  const secret = data.webhookSecret || '';
  const ctype = data.webhookContentType || 'application/json';
  const payload = data.webhookPayload || '';

  const endpointUrl = `${window.location.origin}/api/webhook/${path}`;

  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(endpointUrl).catch(() => {});
  }, [endpointUrl]);

  const simulateRequest = useCallback(() => {
    const pl = payload || '{"hello":"world"}';
    setNodes((nodes) => nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, webhookPayload: pl, value: pl, status: 'completed' } } : n));
  }, [id, payload, setNodes]);

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip} iconSrc={config.iconSrc}>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700 mb-3">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Ponto de entrada externo</span>
      </div>

      <div className="space-y-2 mb-2 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Método</label>
          <select className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={method} onChange={(e) => updateNode('webhookMethod', e.target.value)}>
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Path</label>
          <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={path} onChange={(e) => updateNode('webhookPath', e.target.value)} placeholder="meu-endpoint" />
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Content-Type</label>
          <select className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={ctype} onChange={(e) => updateNode('webhookContentType', e.target.value)}>
            <option value="application/json">application/json</option>
            <option value="text/plain">text/plain</option>
            <option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Secret</label>
          <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={secret} onChange={(e) => updateNode('webhookSecret', e.target.value)} placeholder="Opcional" />
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-md p-2 border border-slate-200 dark:border-slate-700">
        <div className="text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate">{endpointUrl}</div>
        <button className="px-2 py-1 rounded text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={copyUrl}><Copy size={12} /> Copiar</button>
      </div>

      <LabelArea label="Payload de teste (JSON ou texto)">
        <textarea className="nodrag w-full text-[10px] p-2 border border-slate-200 dark:border-slate-600 rounded-md focus:border-blue-500 outline-none resize-none h-16 text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-900 leading-tight placeholder-slate-400 dark:placeholder-slate-500" placeholder='{"hello":"world"}' value={payload} onChange={(e) => updateNode('webhookPayload', e.target.value)} />
      </LabelArea>

      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
        <span className="text-[10px] text-slate-400 font-medium">Output: String/JSON</span>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 rounded text-[10px] bg-orange-500 text-white font-bold hover:bg-orange-600" onClick={simulateRequest}>Simular requisição</button>
        </div>
      </div>
    </NodeContainer>
  );
});

// 11. Router Node
/**
 * Nó de roteamento: direciona payload para múltiplas saídas.
 */
export const RouterNode = memo(({ id, type, data, selected }: NodeProps) => {
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.ROUTER];
  const { setNodes, getEdges } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const [handleStep, setHandleStep] = useState(32);
  const { isDarkMode } = useTheme();
  const COLOR_HEX: Record<string, string> = {
    blue: '#3b82f6',
    purple: '#a855f7',
    indigo: '#6366f1',
    cyan: '#06b6d4',
    teal: '#14b8a6',
    orange: '#f97316',
    amber: '#f59e0b',
    rose: '#f43f5e',
    green: '#10b981',
    slate: '#64748b'
  };
  const useBrand = config.brandHex && config.brandHex.toLowerCase() !== '#000000' ? config.brandHex : undefined;
  const connectorColor = useBrand || COLOR_HEX[config.color] || '#64748b';
  const toRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const connectorBg = toRgba(connectorColor, isDarkMode ? 0.22 : 0.35);
  type RouterField = 'routerMode' | 'routerIndex' | 'routerCount';
  const updateNode = useCallback((field: RouterField, value: string) => {
    setNodes((nodes) => nodes.map((n) => {
      if (n.id !== id) return n;
      const outCount = getEdges().filter(e => e.source === id).length;
      let routerError = '';
      if (field === 'routerIndex') {
        const idx = parseInt(value ?? '0', 10);
        if (isNaN(idx) || idx < 0 || idx >= Math.max(outCount, 1)) {
          routerError = `Índice inválido. Use 0 até ${Math.max(outCount - 1, 0)}`;
        }
      }
      if (field === 'routerCount') {
        const count = Math.max(1, Math.min(8, parseInt(String(value || '1'), 10) || 1));
        let idx = parseInt(String(n.data?.routerIndex ?? '0'), 10) || 0;
        if (idx >= count) idx = count - 1;
        return { ...n, data: { ...n.data, routerCount: String(count), routerIndex: String(idx), routerError } };
      }
      return { ...n, data: { ...n.data, [field]: value, routerError } };
    }));
  }, [id, setNodes]);
  const mode = data.routerMode || 'all';
  const indexVal = data.routerIndex ?? '0';
  const routerCount = parseInt(String(data.routerCount ?? 3), 10) || 3;
  const edgeCountsByIndex = Array.from({ length: routerCount }, (_, i) => getEdges().filter(e => e.source === id && String(e.sourceHandle || '') === `out-${i}`).length);
  useEffect(() => {
    const h = containerRef.current?.offsetHeight ?? 240;
    const topBase = 96;
    const bottomMargin = 48;
    const handleSize = 32;
    const verticalRange = Math.max(h - topBase - bottomMargin, handleSize);
    const step = Math.max(handleSize + 8, Math.floor(verticalRange / Math.max(routerCount - 1, 1)));
    setHandleStep(step);
  }, [routerCount]);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const h = el.offsetHeight;
      const topBase = 96;
      const bottomMargin = 48;
      const handleSize = 32;
      const verticalRange = Math.max(h - topBase - bottomMargin, handleSize);
      const step = Math.max(handleSize + 8, Math.floor(verticalRange / Math.max(routerCount - 1, 1)));
      setHandleStep(step);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [routerCount]);
  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip} containerRef={containerRef} handleRight={false}>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700 mb-3">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Input do Nó Anterior</span>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 flex flex-col gap-2 mb-2">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-1"><Settings2 size={10} /><span className="text-[10px] font-bold uppercase">Roteamento</span></div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Modo</label>
          <select className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none" value={mode} onChange={(e) => updateNode('routerMode', e.target.value)}>
            <option value="all">Todas as saídas</option>
            <option value="single">Apenas uma saída</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-1 items-center">
          <label className="text-[9px] text-slate-400 font-semibold">Qtd. saídas</label>
          <div className="col-span-2 flex items-center gap-1">
            <button className="px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" onClick={() => updateNode('routerCount', String(Math.max(1, routerCount - 1)))}><Minus size={12} /></button>
            <input type="number" min={1} max={8} className="nodrag w-12 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={routerCount} onChange={(e) => updateNode('routerCount', e.target.value)} />
            <button className="px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" onClick={() => updateNode('routerCount', String(Math.min(8, routerCount + 1)))}><Plus size={12} /></button>
          </div>
        </div>
        {mode === 'single' && (
          <div className="grid grid-cols-3 gap-1 items-center">
            <label className="text-[9px] text-slate-400 font-semibold">Índice da saída</label>
            <input className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={indexVal} onChange={(e) => updateNode('routerIndex', e.target.value)} placeholder="0" />
          </div>
        )}
      </div>
      {data.routerError && <div className="text-[9px] text-red-500 font-bold ml-1">{data.routerError}</div>}
      <div className="flex items-center gap-1 mt-2">
        <span className="text-[9px] text-slate-400">Saídas:</span>
        {Array.from({ length: Math.max(routerCount, 1) }, (_, i) => {
          const selected = mode === 'single' && i === (parseInt(String(indexVal), 10) || 0);
          const count = edgeCountsByIndex[i] ?? 0;
          const base = i === 0 ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300';
          const ring = selected ? ' ring-2 ring-orange-300 dark:ring-orange-700' : '';
          return (
            <span key={i} className={`px-2 py-0.5 rounded border text-[9px]${ring} ${base}`}>
              {i} · {count}
            </span>
          );
        })}
      </div>
      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Output: Control</span>
         <StatusBadge status={data.status} />
      </div>
      {Array.from({ length: routerCount }, (_, i) => (
        <div key={i} className="group/hdl absolute" style={{ right: -60, top: 96 + (i * handleStep), zIndex: 7 }}>
          <Handle 
            id={`out-${i}`} 
            type="source" 
            position={Position.Right} 
            style={{ width: 32, height: 32, backgroundColor: connectorBg, borderColor: connectorColor, borderWidth: 3, borderStyle: 'solid', borderRadius: '9999px' }}
            className={`${data.activeHandle === `out-${i}` ? 'ring-2 ring-orange-300 dark:ring-orange-700' : ''} transition-colors`} 
          />
          <div className={`absolute -right-24 top-1 px-2 py-1 rounded border text-[9px] invisible opacity-0 translate-x-2 group-hover/hdl:visible group-hover/hdl:opacity-100 group-hover/hdl:translate-x-0 transition duration-200 ease-out bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xl`}>out-{i}</div>
        </div>
      ))}
    </NodeContainer>
  );
});

// 12. Function Node
/**
 * Nó de função: aplica transformação JavaScript ao payload.
 */
export const FunctionNode = memo(({ id, type, data, selected }: NodeProps) => {
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.FUNCTION];
  const { setNodes } = useReactFlow();
  type FnField = 'fnBody';
  const updateNode = useCallback((field: FnField, value: string) => {
    setNodes((nodes) => nodes.map((n) => {
      if (n.id !== id) return n;
      let fnError = '';
      try {
        new Function('input', String(value || 'return input;'));
      } catch (e: any) {
        fnError = String(e?.message || 'Erro de sintaxe');
      }
      return { ...n, data: { ...n.data, [field]: value, fnError } };
    }));
  }, [id, setNodes]);
  const fnBody = data.fnBody || 'return input;';
  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip}>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700 mb-3">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Input do Nó Anterior</span>
      </div>
      <LabelArea label="Function Body (JS)">
        <textarea className="nodrag w-full text-[10px] p-2 border border-slate-200 dark:border-slate-600 rounded-md focus:border-blue-500 outline-none resize-none h-16 text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-900 leading-tight placeholder-slate-400 dark:placeholder-slate-500" placeholder="Ex: return input.toUpperCase();" value={fnBody} onChange={(e) => updateNode('fnBody', e.target.value)} />
        {data.fnError && <div className="text-[9px] text-red-500 font-bold ml-1">{data.fnError}</div>}
      </LabelArea>
      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Output: Control</span>
         <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});

// 13. Condition Node
/**
 * Nó de condição: avalia expressão booleana e seleciona saída.
 */
export const ConditionNode = memo(({ id, type, data, selected }: NodeProps) => {
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.CONDITION];
  const { setNodes } = useReactFlow();
  const { isDarkMode } = useTheme();
  const toRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const GREEN = '#10b981';
  const ROSE = '#f43f5e';
  const trueBg = toRgba(GREEN, isDarkMode ? 0.22 : 0.35);
  const falseBg = toRgba(ROSE, isDarkMode ? 0.22 : 0.35);
  type CondField = 'conditionExpr';
  const updateNode = useCallback((field: CondField, value: string) => {
    setNodes((nodes) => nodes.map((n) => {
      if (n.id !== id) return n;
      let conditionError = '';
      try {
        // eslint-disable-next-line no-new-func
        new Function('input', `return !!(${String(value || 'input && input.length > 0')});`);
      } catch (e: any) {
        conditionError = String(e?.message || 'Erro de sintaxe');
      }
      return { ...n, data: { ...n.data, [field]: value, conditionError } };
    }));
  }, [id, setNodes]);
  const expr = data.conditionExpr || "input && input.length > 0";
  const outTrueSelected = String(data.value || '').toLowerCase() === 'true';
  const outFalseSelected = String(data.value || '').toLowerCase() === 'false';
  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip} handleRight={false}>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700 mb-3">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Input do Nó Anterior</span>
      </div>
      <LabelArea label="Expressão Booleana">
        <input className="nodrag w-full text-[10px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={expr} onChange={(e) => updateNode('conditionExpr', e.target.value)} placeholder="Ex: input.includes('sucesso')" />
        <div className="text-[9px] text-slate-400 dark:text-slate-500 ml-1">Verdadeiro → 1ª saída, Falso → 2ª saída</div>
        {data.conditionError && <div className="text-[9px] text-red-500 font-bold ml-1">{data.conditionError}</div>}
      </LabelArea>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[9px] text-slate-400">Saídas:</span>
        <span className={`px-2 py-0.5 rounded border text-[9px] bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-600 dark:text-green-300 ${outTrueSelected ? 'ring-2 ring-orange-300 dark:ring-orange-700' : ''}`}>True · {1}</span>
        <span className={`px-2 py-0.5 rounded border text-[9px] bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 ${outFalseSelected ? 'ring-2 ring-orange-300 dark:ring-orange-700' : ''}`}>False · {1}</span>
      </div>
      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Output: Control</span>
         <StatusBadge status={data.status} />
      </div>
      <div className="group/hdl absolute" style={{ right: -60, top: 96, zIndex: 7 }}>
        <Handle id="true" type="source" position={Position.Right} style={{ width: 32, height: 32, backgroundColor: trueBg, borderColor: GREEN, borderWidth: 3, borderStyle: 'solid', borderRadius: '9999px' }} className={`${data.activeHandle === 'true' ? 'ring-2 ring-orange-300 dark:ring-orange-700' : ''}`} />
        <div className={`absolute -right-24 top-0 px-2 py-1 rounded border text-[9px] invisible opacity-0 translate-x-2 group-hover/hdl:visible group-hover/hdl:opacity-100 group-hover/hdl:translate-x-0 transition duration-200 ease-out bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 shadow-2xl`}>true</div>
      </div>
      <div className="group/hdl absolute" style={{ right: -60, top: 144, zIndex: 7 }}>
        <Handle id="false" type="source" position={Position.Right} style={{ width: 32, height: 32, backgroundColor: falseBg, borderColor: ROSE, borderWidth: 3, borderStyle: 'solid', borderRadius: '9999px' }} className={`${data.activeHandle === 'false' ? 'ring-2 ring-orange-300 dark:ring-orange-700' : ''}`} />
        <div className={`absolute -right-24 top-0 px-2 py-1 rounded border text-[9px] invisible opacity-0 translate-x-2 group-hover/hdl:visible group-hover/hdl:opacity-100 group-hover/hdl:translate-x-0 transition duration-200 ease-out bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-2xl`}>false</div>
      </div>
    </NodeContainer>
  );
});

/**
 * Nó de espera: aguarda tempo antes de continuar o fluxo.
 */
export const WaitNode = memo(({ id, type, data, selected }: NodeProps) => {
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.WAIT];
  const { setNodes } = useReactFlow();
  type WaitField = 'waitMs' | 'waitUnit';
  const updateNode = useCallback((field: WaitField, value: string) => {
    setNodes((nodes) => nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n));
  }, [id, setNodes]);
  const ms = parseInt(String(data.waitMs ?? '1000'), 10) || 0;
  const unit = data.waitUnit || 'ms';
  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip}>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700 mb-3">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Input do Nó Anterior</span>
      </div>

      <div className="grid grid-cols-3 gap-1 items-center mb-2">
        <label className="text-[9px] text-slate-400 font-semibold">Delay</label>
        <div className="col-span-2 flex items-center gap-1">
          <button className="px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" onClick={() => updateNode('waitMs', String(Math.max(0, ms - (unit === 's' ? 1 : 100))))}>-</button>
          <input type="number" min={0} className="nodrag w-20 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={ms} onChange={(e) => updateNode('waitMs', e.target.value)} />
          <button className="px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" onClick={() => updateNode('waitMs', String(ms + (unit === 's' ? 1 : 100)))}>+</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 items-center">
        <label className="text-[9px] text-slate-400 font-semibold">Unidade</label>
        <div className="col-span-2 flex items-center gap-1">
          <button onClick={() => updateNode('waitUnit', 'ms')} className={`text-[9px] px-2 py-1 rounded border ${unit === 'ms' ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200'}`}>ms</button>
          <button onClick={() => updateNode('waitUnit', 's')} className={`text-[9px] px-2 py-1 rounded border ${unit === 's' ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200'}`}>s</button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Output: Control</span>
         <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});

/**
 * Nó de merge: combina múltiplas entradas em uma saída.
 */
export const MergeNode = memo(({ id, type, data, selected }: NodeProps) => {
  const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS] || NODE_CONFIGS[NodeType.MERGE];
  const { setNodes, getEdges } = useReactFlow();
  type MergeField = 'mergeExpected' | 'mergeStrategy' | 'mergeAutoReset' | 'mergePriority' | 'mergeArrayMode' | 'mergeSourcePrefix';
  const updateNode = useCallback((field: MergeField, value: string | boolean) => {
    setNodes((nodes) => nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n));
  }, [id, setNodes]);

  const expected = parseInt(String(data.mergeExpected ?? '2'), 10) || 2;
  const strategy = data.mergeStrategy || 'concat';
  const arrayMode = data.mergeArrayMode || 'replace';
  const sourcePrefix = String(data.mergeSourcePrefix || '');
  const edgesIn = getEdges().filter(e => e.target === id);
  const received = Array.isArray(data.mergeItems) ? data.mergeItems.length : Object.keys(data.mergeMap || {}).length;
  const values = Object.values(data.mergeMap || {});
  const [showAll, setShowAll] = useState(false);
  const preview = showAll ? values : values.slice(0, 3);

  return (
    <NodeContainer nodeId={id} nodeType={type} selected={selected} title={config.title} icon={config.icon} color={config.color} tooltip={config.tooltip}>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700 mb-3">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Aguardando entradas paralelas</span>
      </div>

      <div className="grid grid-cols-3 gap-1 items-center mb-2">
        <label className="text-[9px] text-slate-400 font-semibold">Esperar entradas</label>
        <div className="col-span-2 flex items-center gap-1">
          <button className="px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" onClick={() => updateNode('mergeExpected', String(Math.max(1, expected - 1)))}>-</button>
          <input type="number" min={1} className="nodrag w-20 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" value={expected} onChange={(e) => updateNode('mergeExpected', e.target.value)} />
          <button className="px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" onClick={() => updateNode('mergeExpected', String(expected + 1))}>+</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 items-center mb-2">
        <label className="text-[9px] text-slate-400 font-semibold">Estratégia</label>
        <select className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none" value={strategy} onChange={(e) => updateNode('mergeStrategy', e.target.value)}>
          <option value="concat">Concatenar (Array)</option>
          <option value="first">Primeiro concluído</option>
          <option value="latest">Último concluído</option>
          <option value="object-merge">Merge de objetos por chave</option>
          <option value="deep-merge">Merge profundo recursivo</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-1 items-center mb-2">
        <label className="text-[9px] text-slate-400 font-semibold">Arrays (deep/object)</label>
        <select className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none" value={arrayMode} onChange={(e) => updateNode('mergeArrayMode', e.target.value)}>
          <option value="replace">Substituir</option>
          <option value="concat">Concatenar</option>
          <option value="by-index">Mesclar por índice</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-1 items-center mb-2">
        <label className="text-[9px] text-slate-400 font-semibold">Prefixo de origem</label>
        <input 
          type="text" 
          className="nodrag col-span-2 text-[9px] p-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none" 
          placeholder="ex: origin" 
          value={sourcePrefix} 
          onChange={(e) => updateNode('mergeSourcePrefix', e.target.value)} 
        />
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span className="text-[9px] text-slate-400">Recebidos:</span>
        <span className={`px-2 py-0.5 rounded border text-[9px] ${received >= expected ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>{received}/{expected}</span>
        <span className="text-[9px] text-slate-400">Entradas:</span>
        <span className="px-2 py-0.5 rounded border text-[9px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">{edgesIn.length}</span>
      </div>

      <div className="mt-2 border rounded p-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-300">Itens coletados</span>
          {values.length > 3 && (
            <button className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300" onClick={() => setShowAll(!showAll)}>
              <Eye size={12} /> {showAll ? 'Ver menos' : 'Ver todos'}
            </button>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {preview.map((v: any, idx: number) => (
            <span key={idx} className="px-2 py-0.5 rounded border text-[9px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
              {typeof v === 'string' ? v : JSON.stringify(v)}
            </span>
          ))}
          {values.length === 0 && (
            <span className="text-[9px] text-slate-400">Nenhum item</span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
         <span className="text-[10px] text-slate-400 font-medium">Output: String (JSON)</span>
         <StatusBadge status={data.status} />
      </div>
    </NodeContainer>
  );
});
