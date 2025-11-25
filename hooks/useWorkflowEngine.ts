
import { useState, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { NodeType } from '../types';
import { generateText, generateImage } from '../services/geminiService';
import { NODE_CONFIGS } from '../config';

export function useWorkflowEngine() {
  const { getNodes, getEdges, setNodes } = useReactFlow();
  const [isRunning, setIsRunning] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Helper para atualizar dados de um nó específico
  const updateNodeStatus = useCallback((id: string, partialData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          // Lógica de reset de erro caso venha novo valor
          const status = (partialData.value && partialData.value.trim().length > 0 && node.data.status === 'error') 
            ? 'idle' 
            : (partialData.status || node.data.status);
          return { ...node, data: { ...node.data, ...partialData, status } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const buildSupabaseRequest = (
    baseUrl: string,
    apiKey: string,
    table: string,
    op: string,
    payloadObj: any,
    prevPayload: any
  ) => {
    const root = `${baseUrl.replace(/\/$/, '')}/rest/v1/${table}`;
    const headers: Record<string, string> = { apikey: apiKey, Authorization: `Bearer ${apiKey}` };
    let method = 'GET';
    let body: any = undefined;
    let url = root;
    const qs: string[] = [];

    const encode = (v: any) => encodeURIComponent(String(v));
    const applyFilters = (where: any) => {
      if (!where || typeof where !== 'object') return;
      for (const key of Object.keys(where)) {
        const val = where[key];
        if (val === null || typeof val !== 'object' || Array.isArray(val)) {
          if (Array.isArray(val)) {
            qs.push(`${key}=in.(${val.map((x) => encode(x)).join(',')})`);
          } else {
            qs.push(`${key}=eq.${encode(val)}`);
          }
          continue;
        }
        const ops = ['eq','neq','gt','gte','lt','lte','like','ilike','is','in'];
        const opKey = ops.find((o) => val[o] !== undefined);
        if (opKey) {
          if (opKey === 'in' && Array.isArray(val[opKey])) {
            qs.push(`${key}=in.(${val[opKey].map((x: any) => encode(x)).join(',')})`);
          } else {
            qs.push(`${key}=${opKey}.${encode(val[opKey])}`);
          }
        }
      }
    };

    if (op === 'select') {
      const columns = Array.isArray(payloadObj?.columns) ? payloadObj.columns.join(',') : (payloadObj?.select || '*');
      qs.push(`select=${columns}`);
      applyFilters(payloadObj?.where);
      if (payloadObj?.order && payloadObj.order.column) {
        const col = payloadObj.order.column;
        const dir = payloadObj.order.desc ? 'desc' : 'asc';
        qs.push(`order=${col}.${dir}`);
      }
      if (payloadObj?.limit) qs.push(`limit=${Number(payloadObj.limit) || 0}`);
      headers['Prefer'] = 'return=representation';
      if (payloadObj?.range && payloadObj.range.from !== undefined && payloadObj.range.to !== undefined) {
        headers['Range'] = `${Number(payloadObj.range.from)}-${Number(payloadObj.range.to)}`;
      }
    } else if (op === 'insert') {
      method = 'POST';
      headers['Content-Type'] = 'application/json';
      headers['Prefer'] = 'return=representation';
      body = payloadObj?.values !== undefined ? payloadObj.values : prevPayload;
    } else if (op === 'update') {
      method = 'PATCH';
      headers['Content-Type'] = 'application/json';
      headers['Prefer'] = 'return=representation';
      body = payloadObj?.set !== undefined ? payloadObj.set : prevPayload;
      applyFilters(payloadObj?.where);
    } else if (op === 'delete') {
      method = 'DELETE';
      headers['Prefer'] = 'return=minimal';
      applyFilters(payloadObj?.where);
    }

    if (qs.length) url = `${root}?${qs.join('&')}`;
    return { url, method, headers, body: body ? JSON.stringify(body) : undefined };
  };

  const processNodeChildren = async (sourceId: string, payload: any, graphEdges?: ReturnType<typeof getEdges>, nodeMap?: Map<string, any>, visited?: Set<string>) => {
    const edges = graphEdges || getEdges();
    const nodes = nodeMap ? Array.from(nodeMap.values()) : getNodes();
    let outgoingEdges = edges.filter(e => e.source === sourceId);
    const seen = visited || new Set<string>();
    const sourceNode = nodeMap ? nodeMap.get(sourceId) : nodes.find(n => n.id === sourceId);

    // Pré-processamento para nós de controle de fluxo (como Source)
    try {
      if (sourceNode) {
        // Function: transforma o payload
        if (sourceNode.type === NodeType.FUNCTION) {
          const body = (sourceNode.data?.fnBody || 'return input;') as string;
          try {
            const fn = new Function('input', body);
            const transformed = fn(payload);
            payload = typeof transformed === 'undefined' ? payload : transformed;
            updateNodeStatus(sourceNode.id, { status: 'completed', value: String(payload ?? '') });
          } catch {
            updateNodeStatus(sourceNode.id, { status: 'error' });
          }
        }

        // Condition: decide qual saída seguir
        if (sourceNode.type === NodeType.CONDITION) {
          const expr = (sourceNode.data?.conditionExpr || 'input && input.length > 0') as string;
          let resultBool = false;
          try {
            const evalFn = new Function('input', `return !!(${expr});`);
            resultBool = !!evalFn(payload);
            updateNodeStatus(sourceNode.id, { status: 'completed', value: String(resultBool) });
          } catch {
            updateNodeStatus(sourceNode.id, { status: 'error' });
          }
          const desired = resultBool ? 'true' : 'false';
          updateNodeStatus(sourceNode.id, { activeHandle: desired });
          setTimeout(() => updateNodeStatus(sourceNode.id, { activeHandle: '' }), 800);
          const byHandle = outgoingEdges.filter(e => String(e.sourceHandle || '') === desired);
          outgoingEdges = byHandle.length ? byHandle : outgoingEdges.filter((_, idx) => idx === (resultBool ? 0 : 1));
        }

        // Router: escolhe uma ou todas as saídas
        if (sourceNode.type === NodeType.ROUTER) {
          const mode = (sourceNode.data?.routerMode || 'all') as string;
          if (mode === 'single') {
            const rawIdx = parseInt(sourceNode.data?.routerIndex ?? '0', 10);
            const validIdx = isNaN(rawIdx) ? 0 : Math.min(Math.max(rawIdx, 0), Math.max(outgoingEdges.length - 1, 0));
            const idWanted = `out-${validIdx}`;
            updateNodeStatus(sourceNode.id, { activeHandle: idWanted });
            setTimeout(() => updateNodeStatus(sourceNode.id, { activeHandle: '' }), 800);
            const byHandle = outgoingEdges.filter(e => String(e.sourceHandle || '') === idWanted);
            outgoingEdges = byHandle.length ? byHandle : outgoingEdges.filter((_, i) => i === validIdx);
          }
          updateNodeStatus(sourceNode.id, { status: 'completed', value: String(payload ?? '') });
        }

        // Wait: aguarda tempo antes de prosseguir
        if (sourceNode.type === NodeType.WAIT) {
          const unit = String(sourceNode.data?.waitUnit || 'ms');
          const msVal = parseInt(String(sourceNode.data?.waitMs ?? '1000'), 10) || 0;
          const delayMs = unit === 's' ? msVal * 1000 : msVal;
          updateNodeStatus(sourceNode.id, { status: 'running' });
          await new Promise((res) => setTimeout(res, Math.max(0, delayMs)));
          updateNodeStatus(sourceNode.id, { status: 'completed', value: String(payload ?? '') });
        }
      }
    } catch {}
    
      for (const edge of outgoingEdges) {
      const targetNode = nodeMap ? nodeMap.get(edge.target) : nodes.find(n => n.id === edge.target);
      if (!targetNode) continue;
      if (seen.has(targetNode.id)) continue;
      seen.add(targetNode.id);

      let result = payload;

      try {
        // --- TEXT NODES ---
        if (
            targetNode.type === NodeType.PROMPT_ENHANCER ||
            targetNode.type === NodeType.GEMINI_3_PRO ||
            targetNode.type === NodeType.GEMINI_2_5_FLASH ||
            targetNode.type === NodeType.GEMINI_FLASH_LITE
        ) {
          updateNodeStatus(targetNode.id, { status: 'running' });
          const cfg = NODE_CONFIGS[targetNode.type as keyof typeof NODE_CONFIGS];
          const modelToUse = targetNode.data.model || cfg?.defaultModel || targetNode.type;
          const systemInstruction = targetNode.data.systemMessage;

          result = await generateText(payload, modelToUse, { systemInstruction });
          updateNodeStatus(targetNode.id, { status: 'completed', value: result });
        } 
        else if (
            targetNode.type === NodeType.CLAUDE_AGENT ||
            targetNode.type === NodeType.DEEPSEEK_AGENT ||
            targetNode.type === NodeType.OPENAI_AGENT ||
            targetNode.type === NodeType.MISTRAL_AGENT ||
            targetNode.type === NodeType.HUGGING_FACE_AGENT ||
            targetNode.type === NodeType.KIMI_AGENT ||
            targetNode.type === NodeType.GROK_AGENT
        ) {
          updateNodeStatus(targetNode.id, { status: 'completed', value: String(payload ?? '') });
          result = payload;
        }
        // --- IMAGE NODES ---
        else if (
            targetNode.type === NodeType.IMAGE_GENERATOR || 
            targetNode.type === NodeType.NANO_BANANA || 
            targetNode.type === NodeType.NANO_BANANA_PRO
        ) {
          if (!payload || typeof payload !== 'string' || payload.trim().length === 0) {
            updateNodeStatus(targetNode.id, { status: 'error' });
            continue; 
          }

          // Validação e Defaults
          const validRatios = ["Auto", "1:1", "16:9", "4:3", "9:16", "3:4", "3:2", "2:3", "5:4", "4:5", "21:9"];
          let aspectRatio = targetNode.data.aspectRatio;
          if (!validRatios.includes(aspectRatio)) aspectRatio = "1:1";

          let resolution = targetNode.data.resolution;
          if (targetNode.type === NodeType.NANO_BANANA_PRO) {
             if (resolution !== "1K" && resolution !== "2K" && resolution !== "4K") resolution = "1K";
          } else {
             resolution = "1K"; 
          }

          updateNodeStatus(targetNode.id, { status: 'running' });
          
          const imgCfg = NODE_CONFIGS[targetNode.type as keyof typeof NODE_CONFIGS];
          let modelId = imgCfg?.modelName || (targetNode.type === NodeType.NANO_BANANA_PRO ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image');

          result = await generateImage(payload, modelId, { aspectRatio, resolution });
          updateNodeStatus(targetNode.id, { status: 'completed', value: result, imageUrl: result });
        } 
        else if (targetNode.type === NodeType.REDIS) {
          const host = targetNode.data.redisHost || '';
          const token = targetNode.data.redisPassword || '';
          const action = targetNode.data.redisAction || 'GET';
          const key = targetNode.data.redisKey || '';
          const value = targetNode.data.redisValue || (typeof payload === 'string' ? payload : JSON.stringify(payload || ''));
          if (!host || !token || !key) {
            updateNodeStatus(targetNode.id, { status: 'error' });
            continue;
          }
          updateNodeStatus(targetNode.id, { status: 'running' });
          const body: any = { command: action, args: action === 'SET' ? [key, value] : [key] };
          const resp = await fetch(host, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body)
          });
          const json = await resp.json().catch(() => ({}));
          result = json?.result ?? json ?? null;
          updateNodeStatus(targetNode.id, { status: 'completed', value: typeof result === 'string' ? result : JSON.stringify(result) });
        }
        else if (targetNode.type === NodeType.SUPABASE) {
          const baseUrl = targetNode.data.supabaseUrl || '';
          const apiKey = targetNode.data.supabaseKey || '';
          const table = targetNode.data.supabaseTable || '';
          const op = targetNode.data.supabaseOperation || 'select';
          const payloadStr = targetNode.data.supabasePayload || '';
          if (!baseUrl || !apiKey || !table) {
            updateNodeStatus(targetNode.id, { status: 'error' });
            continue;
          }
          updateNodeStatus(targetNode.id, { status: 'running' });
          let payloadObj: any = {};
          try { payloadObj = payloadStr ? JSON.parse(payloadStr) : {}; } catch { payloadObj = {}; }
          const req = buildSupabaseRequest(baseUrl, apiKey, table, op, payloadObj, payload);
          const resp = await fetch(req.url, { method: req.method, headers: req.headers, body: req.body });
          const text = await resp.text();
          try { result = JSON.parse(text); } catch { result = text; }
          updateNodeStatus(targetNode.id, { status: 'completed', value: typeof result === 'string' ? result : JSON.stringify(result) });
        }
        else if (
            targetNode.type === NodeType.ROUTER ||
            targetNode.type === NodeType.FUNCTION ||
            targetNode.type === NodeType.CONDITION ||
            targetNode.type === NodeType.WAIT
        ) {
          updateNodeStatus(targetNode.id, { status: 'completed', value: String(payload ?? '') });
          result = payload;
        }
        // --- DISPLAY NODES ---
        else if (targetNode.type === NodeType.IMAGE_DISPLAY) {
           updateNodeStatus(targetNode.id, { imageUrl: payload, status: 'completed' });
        }
        else if (targetNode.type === NodeType.VIDEO_DISPLAY) {
           updateNodeStatus(targetNode.id, { videoUrl: payload, status: 'completed' });
        }
        // --- MESSAGE OUTPUT ---
        else if (targetNode.type === NodeType.MESSAGE_OUTPUT) {
           updateNodeStatus(targetNode.id, { value: String(payload ?? ''), status: 'completed' });
        }

        // Recursão
        await processNodeChildren(targetNode.id, result, edges, nodeMap, seen);

      } catch (error: any) {
        updateNodeStatus(targetNode.id, { status: 'error' });
        // Propaga o erro para parar o fluxo ou para ser capturado pelo runner principal
        throw error;
      }
    }
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    setAuthError(false);
    
    // Limpa erros anteriores
    setNodes((nds) => nds.map(n => ({ 
      ...n, 
      data: { ...n.data, status: n.data.status === 'error' ? 'idle' : n.data.status } 
    })));

    try {
      const nodes = getNodes();
      const nodeMap = new Map<string, any>(nodes.map(n => [n.id, n]));
      const edges = getEdges();
      const promptInputs = nodes.filter(n => n.type === NodeType.PROMPT_INPUT);
      const videoInputs = nodes.filter(n => n.type === NodeType.VIDEO_UPLOAD);
      const xmlInputs = nodes.filter(n => n.type === NodeType.XML_UPLOAD);
      const pdfInputs = nodes.filter(n => n.type === NodeType.PDF_UPLOAD);
      const webhookInputs = nodes.filter(n => n.type === NodeType.WEBHOOK);

      if (promptInputs.length === 0 && videoInputs.length === 0 && xmlInputs.length === 0 && pdfInputs.length === 0 && webhookInputs.length === 0) {
          throw new Error("NO_INPUT_NODE");
      }

      for (const inputNode of promptInputs) {
        const promptText = inputNode.data.value;

        if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') {
            updateNodeStatus(inputNode.id, { status: 'error' });
            throw new Error("VALIDATION_ERROR");
        }

        updateNodeStatus(inputNode.id, { status: 'completed' });
        await processNodeChildren(inputNode.id, promptText, edges, nodeMap, new Set<string>());
      }

      for (const videoNode of videoInputs) {
        const videoPayload = videoNode.data.videoUrl || videoNode.data.value;
        if (!videoPayload || typeof videoPayload !== 'string' || videoPayload.trim() === '') {
            updateNodeStatus(videoNode.id, { status: 'error' });
            continue;
        }

        updateNodeStatus(videoNode.id, { status: 'completed' });
        await processNodeChildren(videoNode.id, videoPayload, edges, nodeMap, new Set<string>());
      }

      for (const xmlNode of xmlInputs) {
        const xmlPayload = xmlNode.data.xmlContent || xmlNode.data.value;
        if (!xmlPayload || typeof xmlPayload !== 'string' || xmlPayload.trim() === '') {
            updateNodeStatus(xmlNode.id, { status: 'error' });
            continue;
        }
        updateNodeStatus(xmlNode.id, { status: 'completed' });
        await processNodeChildren(xmlNode.id, xmlPayload, edges, nodeMap, new Set<string>());
      }

      for (const pdfNode of pdfInputs) {
        const pdfPayload = pdfNode.data.pdfUrl || pdfNode.data.value;
        if (!pdfPayload || typeof pdfPayload !== 'string' || pdfPayload.trim() === '') {
            updateNodeStatus(pdfNode.id, { status: 'error' });
            continue;
        }
        updateNodeStatus(pdfNode.id, { status: 'completed' });
        await processNodeChildren(pdfNode.id, pdfPayload, edges, nodeMap, new Set<string>());
      }

      for (const whNode of webhookInputs) {
        const whPayload = whNode.data.webhookPayload || whNode.data.value;
        if (!whPayload || (typeof whPayload === 'string' && whPayload.trim() === '')) {
          // Webhook pode ser externo; se vazio, apenas não processa
          continue;
        }
        updateNodeStatus(whNode.id, { status: 'completed' });
        await processNodeChildren(whNode.id, whPayload, edges, nodeMap, new Set<string>());
      }

    } catch (error: any) {
      console.error("Workflow Execution Error:", error);
      
      const errorMsg = (error.message || JSON.stringify(error)).toLowerCase();
      
      if (errorMsg === "no_input_node") {
          alert("Adicione um nó de entrada (Prompt Input) para começar.");
      } else if (errorMsg === "validation_error") {
          setTimeout(() => alert("Por favor, preencha os campos obrigatórios."), 100);
      } else if (
          errorMsg.includes("permission_denied") || 
          errorMsg.includes("403") || 
          errorMsg.includes("caller does not have permission")
      ) {
         setAuthError(true);
      } else {
         alert("Erro na execução: " + errorMsg.substring(0, 100));
      }

    } finally {
      setIsRunning(false);
    }
  };

  return { runWorkflow, isRunning, authError, setAuthError };
}
