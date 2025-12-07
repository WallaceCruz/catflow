
import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { NodeType } from '../types';
import { NODE_CONFIGS } from '../config';
import { parseXml, validateXml } from '../services/xmlService';
import { createContainer } from '../core/di/container';
import { useWorkflowStore } from '../stores/workflowStore';

/**
 * Executor de workflows com injeção de dependências e baixa acoplamento.
 */
export function useWorkflowEngine() {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const { isRunning, authError, setAuthError, startRun, finishRun, stopRun, requestStop } = useWorkflowStore((s) => ({
    isRunning: s.isRunning,
    authError: s.authError,
    setAuthError: s.setAuthError,
    startRun: s.startRun,
    finishRun: s.finishRun,
    stopRun: s.stopRun,
    requestStop: s.requestStop,
  }));
  const deps = createContainer();

  // Helper para atualizar dados de um nó específico
  const updateNodeStatus = useCallback((id: string, partialData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const prev = node.data.status;
          const status = (partialData.value && typeof partialData.value === 'string' && partialData.value.trim().length > 0 && prev === 'error')
            ? 'idle'
            : (partialData.status || prev || 'pending');
          const next = { ...node, data: { ...node.data, ...partialData, status } };
          if (prev !== status) {
            deps.logger.info(`Node ${id} status changed`, { from: prev, to: status, nodeType: node.type });
          }
          return next;
        }
        return node;
      })
    );
  }, [setNodes, deps.logger]);

  // Supabase moved to service; Redis moved to service; Text/Image moved to services

  const processNodeChildren = async (sourceId: string, payload: any, graphEdges?: ReturnType<typeof getEdges>, nodeMap?: Map<string, any>, visited?: Set<string>) => {
    if (useWorkflowStore.getState().stopRequested) {
      throw new Error('STOP_REQUESTED');
    }
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
          if (useWorkflowStore.getState().stopRequested) {
            throw new Error('STOP_REQUESTED');
          }
          await new Promise((res) => setTimeout(res, Math.max(0, delayMs)));
          updateNodeStatus(sourceNode.id, { status: 'completed', value: String(payload ?? '') });
        }
      }
    } catch (e) {
      deps.logger.debug('Flow control preprocessing error', e);
    }
    
      for (const edge of outgoingEdges) {
        const targetNode = nodeMap ? nodeMap.get(edge.target) : nodes.find(n => n.id === edge.target);
        if (!targetNode) continue;
        if (seen.has(targetNode.id)) continue;
        seen.add(targetNode.id);

        let result = payload;

        try {
          setEdges((eds) => eds.map((e) => e.id === edge.id ? { ...e, data: { ...(e.data || {}), edgeState: 'active' }, animated: true } : e));
          if (useWorkflowStore.getState().stopRequested) {
            throw new Error('STOP_REQUESTED');
          }
        // --- TEXT NODES ---
        if (targetNode.type === NodeType.GEMINI_AGENT) {
          updateNodeStatus(targetNode.id, { status: 'running' });
          const cfg = NODE_CONFIGS[targetNode.type as keyof typeof NODE_CONFIGS];
          const modelToUse = targetNode.data.model || cfg?.defaultModel || 'gemini-2.5-flash';
          const systemInstruction = targetNode.data.systemMessage;
          const temperature = typeof targetNode.data.temperature === 'number' ? targetNode.data.temperature : 0.7;
          const maxTokens = typeof targetNode.data.maxTokens === 'number' ? targetNode.data.maxTokens : 1024;
          const timeoutMs = typeof targetNode.data.timeoutMs === 'number' ? targetNode.data.timeoutMs : 10000;
          const useCache = typeof targetNode.data.cacheEnabled === 'boolean' ? targetNode.data.cacheEnabled : true;

          if (useWorkflowStore.getState().stopRequested) {
            throw new Error('STOP_REQUESTED');
          }
          result = await deps.text.generate(String(payload ?? ''), modelToUse, { systemInstruction, temperature, maxTokens, timeoutMs, useCache });
          updateNodeStatus(targetNode.id, { status: 'completed', value: result });
          setNodes((nds) => nds.map((n) => n.id === targetNode.id ? { ...n, data: { ...n.data, history: [...(Array.isArray(n.data.history) ? n.data.history : []), { prompt: String(payload ?? ''), model: modelToUse, result: String(result ?? ''), ts: Date.now() }] } } : n));
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
          const modelId = imgCfg?.modelName || (targetNode.type === NodeType.NANO_BANANA_PRO ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image');

          if (useWorkflowStore.getState().stopRequested) {
            throw new Error('STOP_REQUESTED');
          }
          result = await deps.image.generate(payload, modelId, { aspectRatio, resolution });
          updateNodeStatus(targetNode.id, { status: 'completed', value: result, imageUrl: result });
        } 
        else if (targetNode.type === NodeType.XML_PARSER) {
          const xmlStr = typeof payload === 'string' ? payload : String(payload ?? '');
          if (!xmlStr.trim()) { updateNodeStatus(targetNode.id, { status: 'error' }); continue; }
          let namespaces: Record<string, string> = {};
          try { if (targetNode.data.xmlNsJson) namespaces = JSON.parse(String(targetNode.data.xmlNsJson || '{}')); } catch { namespaces = {}; }
          const xpath = String(targetNode.data.xmlXPath || '');
          updateNodeStatus(targetNode.id, { status: 'running' });
          const parsed = parseXml(xmlStr, { namespaces, xpath });
          const outVal = typeof parsed.xpathResult !== 'undefined' ? parsed.xpathResult : parsed.object;
          const finalVal = typeof outVal === 'string' ? outVal : JSON.stringify(outVal);
          updateNodeStatus(targetNode.id, { status: parsed.errors.length ? 'error' : 'completed', xmlBody: xmlStr, xmlObject: parsed.object, xmlXPathResult: parsed.xpathResult, xmlErrors: parsed.errors, value: finalVal });
          result = finalVal;
        }
        else if (targetNode.type === NodeType.XML_VALIDATOR) {
          const xmlStr = typeof payload === 'string' ? payload : String(payload ?? '');
          if (!xmlStr.trim()) { updateNodeStatus(targetNode.id, { status: 'error' }); continue; }
          const schemaType = String(targetNode.data.xmlSchemaType || 'none') as 'xsd'|'dtd'|'none';
          const schema = String(targetNode.data.xmlSchema || '');
          let paths: Array<{ path: string; type?: 'string'|'int'|'decimal'|'boolean' }> = [];
          try { if (targetNode.data.xmlValidationPaths) paths = JSON.parse(String(targetNode.data.xmlValidationPaths || '[]')); } catch { paths = []; }
          let namespaces: Record<string, string> = {};
          try { if (targetNode.data.xmlNsJson) namespaces = JSON.parse(String(targetNode.data.xmlNsJson || '{}')); } catch { namespaces = {}; }
          updateNodeStatus(targetNode.id, { status: 'running' });
          const res = validateXml(xmlStr, { schemaType, schema, paths, namespaces });
          const finalVal = res.valid ? 'valid' : 'invalid';
          updateNodeStatus(targetNode.id, { status: res.valid ? 'completed' : 'error', xmlValidationReport: res.report, xmlValidationErrors: res.errors, value: finalVal });
          result = finalVal;
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
          if (useWorkflowStore.getState().stopRequested) {
            throw new Error('STOP_REQUESTED');
          }
          result = await deps.redis.execute(host, token, action, key, value);
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
          const req = deps.supabase.buildRequest(baseUrl, apiKey, table, op, payloadObj, payload);
          if (useWorkflowStore.getState().stopRequested) {
            throw new Error('STOP_REQUESTED');
          }
          result = await deps.supabase.execute(req);
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
        else if (targetNode.type === NodeType.HTTP_REQUEST) {
          const method = (targetNode.data.httpMethod || 'GET') as 'GET'|'POST'|'PUT'|'DELETE';
          const url = String(targetNode.data.httpUrl || '').trim();
          const timeoutMs = Number(targetNode.data.httpTimeoutMs ?? 10000);
          const logEnabled = !!targetNode.data.httpLogEnabled;
          let headersObj: Record<string, string> = {};
          let paramsObj: Record<string, any> = {};
          let bodyStr: string | undefined = undefined;
          try { if (targetNode.data.httpHeaders) headersObj = JSON.parse(String(targetNode.data.httpHeaders || '{}')); } catch { headersObj = {}; }
          try { if (targetNode.data.httpParams) paramsObj = JSON.parse(String(targetNode.data.httpParams || '{}')); } catch { paramsObj = {}; }
          if (targetNode.data.httpBody) bodyStr = String(targetNode.data.httpBody || '');

          const built = deps.httpBuilder.build({
            method,
            url,
            headers: headersObj,
            params: paramsObj,
            body: bodyStr,
            timeoutMs,
            tokenType: String(targetNode.data.httpTokenType || ''),
            accessToken: String(targetNode.data.httpAccessToken || ''),
            pairs: Array.isArray(targetNode.data.httpPairs) ? targetNode.data.httpPairs : [],
          });
          if (!built.valid) {
            updateNodeStatus(targetNode.id, { status: 'error', httpAuthError: built.reason });
            continue;
          }
          headersObj = built.options.headers;
          paramsObj = built.options.params;
          bodyStr = built.options.body;
          updateNodeStatus(targetNode.id, { status: 'running' });
          if (logEnabled) deps.logger.info('HTTP request', { method, url, headers: headersObj, params: paramsObj });
          const resp = await deps.http.request({ method, url, headers: headersObj, params: paramsObj, body: bodyStr, timeoutMs });
          if (logEnabled) deps.logger.debug('HTTP response', { status: resp.status, ok: resp.ok, headers: resp.headers, preview: resp.text?.slice(0, 200) });
          result = resp;
          const authErr = resp.status === 401 || resp.status === 403 ? 'AUTH_ERROR' : undefined;
          updateNodeStatus(targetNode.id, { status: resp.ok ? 'completed' : 'error', value: resp.text, httpStatus: resp.status, httpOk: resp.ok, httpRespHeaders: resp.headers, httpBodyText: resp.text, httpBodyJson: resp.json, httpBodyXml: resp.xml, httpAuthError: authErr });
        }
        else if (targetNode.type === NodeType.HTTP_RESPONSE) {
          const view = String(targetNode.data.httpResponseView || 'auto');
          let textOut = '';
          let jsonOut: any = undefined;
          let xmlOut: any = undefined;
          let statusNum = 0;
          let headersOut: Record<string, string> = {};
          let okOut = false;
          if (payload && typeof payload === 'object' && 'status' in payload) {
            const p = payload as any;
            statusNum = Number(p.status || 0);
            headersOut = p.headers || {};
            okOut = !!p.ok;
            textOut = String(p.text || '');
            jsonOut = p.json;
            xmlOut = p.xml;
          } else {
            textOut = String(payload ?? '');
          }
          const ct = String(headersOut['content-type'] || headersOut['Content-Type'] || '').toLowerCase();
          const finalText = textOut;
          let finalJson: any = jsonOut;
          let finalXml: any = xmlOut;
          if (view === 'json' || (view === 'auto' && ct.includes('application/json'))) {
            if (!finalJson) { try { finalJson = JSON.parse(finalText); } catch {} }
          } else if (view === 'xml' || (view === 'auto' && ct.includes('xml'))) {
            if (!finalXml) { try { finalXml = new DOMParser().parseFromString(finalText, 'application/xml'); } catch {} }
          }
          updateNodeStatus(targetNode.id, { status: okOut ? 'completed' : 'error', httpStatus: statusNum, httpRespHeaders: headersOut, httpOk: okOut, httpBodyText: finalText, httpBodyJson: finalJson, httpBodyXml: finalXml, value: finalText });
          result = finalText;
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
        if (String(error?.message) !== 'STOP_REQUESTED') {
          updateNodeStatus(targetNode.id, { status: 'error' });
        }
        throw error;
      } finally {
        const isStopped = useWorkflowStore.getState().stopRequested;
        const tn = getNodes().find((n) => n.id === (targetNode?.id || ''));
        const status = tn?.data?.status;
        const finalState = isStopped ? 'paused' : (status === 'completed' ? 'success' : (status === 'error' ? 'error' : 'idle'));
        setEdges((eds) => eds.map((e) => (e.id === edge.id ? { ...e, data: { ...(e.data || {}), edgeState: finalState }, animated: false } : e)));
      }
      }
  };

  /**
   * Dispara a execução do workflow corrente.
   */
  const runWorkflow = async () => {
    startRun();
    setEdges((eds) => eds.map((e) => ({ ...e, data: { ...(e.data || {}), edgeState: 'idle' }, animated: false })));
    
    // Limpa erros anteriores
    setNodes((nds) => nds.map(n => ({ 
      ...n, 
      data: { ...n.data, status: n.data.status === 'error' ? 'idle' : n.data.status } 
    })));

    try {
      const nodes = getNodes();
      const nodeMap = new Map<string, any>(nodes.map(n => [n.id, n]));
      const edges = getEdges();
      const startNodes = nodes.filter(n => n.type === NodeType.START);
      const promptInputs = nodes.filter(n => n.type === NodeType.PROMPT_INPUT);
      const videoInputs = nodes.filter(n => n.type === NodeType.VIDEO_UPLOAD);
      const xmlInputs = nodes.filter(n => n.type === NodeType.XML_UPLOAD);
      const pdfInputs = nodes.filter(n => n.type === NodeType.PDF_UPLOAD);
      const webhookInputs = nodes.filter(n => n.type === NodeType.WEBHOOK);
      const httpInputs = nodes.filter(n => n.type === NodeType.HTTP_REQUEST);

      if (startNodes.length === 0 && promptInputs.length === 0 && videoInputs.length === 0 && xmlInputs.length === 0 && pdfInputs.length === 0 && webhookInputs.length === 0 && httpInputs.length === 0) {
          throw new Error("NO_INPUT_NODE");
      }

      // Preferência: se existir nó inicial, executa a partir dele
      if (startNodes.length > 0) {
        if (startNodes.length !== 1) {
          throw new Error('MULTIPLE_START_NODES');
        }
        const start = startNodes[0];
        const incomingToStart = edges.filter(e => e.target === start.id);
        const outgoingFromStart = edges.filter(e => e.source === start.id);
        if (incomingToStart.length > 0) {
          updateNodeStatus(start.id, { status: 'error' });
          throw new Error('START_HAS_INPUTS');
        }
        if (outgoingFromStart.length < 1) {
          updateNodeStatus(start.id, { status: 'error' });
          throw new Error('START_NO_OUTPUTS');
        }
        let initialData: any = {};
        try {
          const raw = start.data.initialData;
          if (typeof raw === 'string' && raw.trim().length > 0) {
            initialData = JSON.parse(raw);
          } else if (typeof raw === 'object' && raw !== null) {
            initialData = raw;
          }
        } catch {}
        // Dependencies check (mínimo)
        const depsOk = !!(deps && deps.text && deps.image && deps.logger);
        if (!depsOk) {
          updateNodeStatus(start.id, { status: 'error' });
          throw new Error('MISSING_DEPENDENCIES');
        }
        // Exec ID e timestamp
        const execId = `exec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const ts = new Date().toISOString();
        const output = { status: 'ready', execution_id: execId, initial_data: initialData };
        updateNodeStatus(start.id, { status: 'completed', executionId: execId, activatedAt: ts, value: JSON.stringify(output) });
        await processNodeChildren(start.id, output, edges, nodeMap, new Set<string>());
        return;
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

      for (const httpReq of httpInputs) {
        const url = String(httpReq.data.httpUrl || '').trim();
        const method = httpReq.data.httpMethod || 'GET';
        if (!url || !/^https?:\/\//i.test(url) || !method) {
          updateNodeStatus(httpReq.id, { status: 'error' });
          continue;
        }
        updateNodeStatus(httpReq.id, { status: 'idle' });
        await processNodeChildren(httpReq.id, '', edges, nodeMap, new Set<string>());
      }

    } catch (error: any) {
      deps.logger.error("Workflow Execution Error:", error);
      
      const errorMsg = (error.message || JSON.stringify(error)).toLowerCase();
      
      if (errorMsg === "no_input_node") {
          alert("Adicione um nó de entrada (Prompt Input) para começar.");
      } else if (errorMsg === "validation_error") {
          setTimeout(() => alert("Por favor, preencha os campos obrigatórios."), 100);
      } else if (errorMsg === 'multiple_start_nodes') {
          alert('Existe mais de um Nó Inicial. Mantenha apenas um.');
      } else if (errorMsg === 'start_has_inputs') {
          alert('O Nó Inicial não pode receber conexões de entrada.');
      } else if (errorMsg === 'start_no_outputs') {
          alert('O Nó Inicial precisa de ao menos uma conexão de saída.');
      } else if (errorMsg === 'missing_dependencies') {
          alert('Dependências indisponíveis. Verifique configurações e chaves.');
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
      finishRun();
    }
  };

  /**
   * Executa fluxo a partir de um nó específico.
   */
  const runFromNode = async (startId: string) => {
    startRun();
    setNodes((nds) => nds.map(n => ({
      ...n,
      data: { ...n.data, status: n.data.status === 'error' ? 'idle' : n.data.status }
    })));
    try {
      const nodes = getNodes();
      const nodeMap = new Map<string, any>(nodes.map(n => [n.id, n]));
      const edges = getEdges();
      const startNode = nodeMap.get(startId);
      if (!startNode) {
        throw new Error('NODE_NOT_FOUND');
      }
      if (useWorkflowStore.getState().stopRequested) {
        throw new Error('STOP_REQUESTED');
      }

      let payload: any = undefined;
      if (startNode.type === NodeType.START) {
        const execId = `exec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const ts = new Date().toISOString();
        let initialData: any = {};
        try {
          const raw = startNode.data.initialData;
          if (typeof raw === 'string' && raw.trim().length > 0) initialData = JSON.parse(raw);
          else if (typeof raw === 'object' && raw !== null) initialData = raw;
        } catch {}
        const output = { status: 'ready', execution_id: execId, initial_data: initialData };
        updateNodeStatus(startNode.id, { status: 'completed', executionId: execId, activatedAt: ts, value: JSON.stringify(output) });
        payload = output;
      } else if (startNode.type === NodeType.PROMPT_INPUT) {
        const promptText = startNode.data.value;
        if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') {
          updateNodeStatus(startNode.id, { status: 'error' });
          throw new Error('VALIDATION_ERROR');
        }
        updateNodeStatus(startNode.id, { status: 'completed' });
        payload = promptText;
      } else if (startNode.type === NodeType.VIDEO_UPLOAD) {
        const videoPayload = startNode.data.videoUrl || startNode.data.value;
        if (!videoPayload || typeof videoPayload !== 'string' || videoPayload.trim() === '') {
          updateNodeStatus(startNode.id, { status: 'error' });
          throw new Error('VALIDATION_ERROR');
        }
        updateNodeStatus(startNode.id, { status: 'completed' });
        payload = videoPayload;
      } else if (startNode.type === NodeType.XML_UPLOAD) {
        const xmlPayload = startNode.data.xmlContent || startNode.data.value;
        if (!xmlPayload || typeof xmlPayload !== 'string' || xmlPayload.trim() === '') {
          updateNodeStatus(startNode.id, { status: 'error' });
          throw new Error('VALIDATION_ERROR');
        }
        updateNodeStatus(startNode.id, { status: 'completed' });
        payload = xmlPayload;
      } else if (startNode.type === NodeType.PDF_UPLOAD) {
        const pdfPayload = startNode.data.pdfUrl || startNode.data.value;
        if (!pdfPayload || typeof pdfPayload !== 'string' || pdfPayload.trim() === '') {
          updateNodeStatus(startNode.id, { status: 'error' });
          throw new Error('VALIDATION_ERROR');
        }
        updateNodeStatus(startNode.id, { status: 'completed' });
        payload = pdfPayload;
      } else if (
        startNode.type === NodeType.ROUTER ||
        startNode.type === NodeType.FUNCTION ||
        startNode.type === NodeType.CONDITION ||
        startNode.type === NodeType.WAIT
      ) {
        // Esses nós são pré-processados em processNodeChildren
        payload = startNode.data.value || '';
      } else {
        // Nó genérico: tenta usar value
        payload = startNode.data.value || '';
        updateNodeStatus(startNode.id, { status: 'completed' });
      }

      await processNodeChildren(startId, payload, edges, nodeMap, new Set<string>());
    } catch (error: any) {
      const msg = String(error?.message || '').toLowerCase();
      if (msg === 'stop_requested') {
        // cancelado pelo usuário, sem alert
      } else if (msg === 'node_not_found') {
        alert('Nó não encontrado para execução.');
      } else if (msg === 'validation_error') {
        setTimeout(() => alert('Por favor, preencha os campos obrigatórios.'), 100);
      } else {
        deps.logger.error('Workflow Execution Error (runFromNode):', error);
        alert('Erro na execução: ' + msg.substring(0, 100));
      }
    } finally {
      finishRun();
    }
  };

  const stopWorkflow = () => {
    stopRun();
    setEdges((eds) => eds.map((e) => ({ ...e, data: { ...(e.data || {}), edgeState: 'paused' }, animated: false })));
    requestStop();
  };

  return { runWorkflow, runFromNode, stopWorkflow, isRunning, authError, setAuthError };
}
