
import { useState, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { NodeType } from '../types';
import { generateText, generateImage } from '../services/geminiService';

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

  const processNodeChildren = async (sourceId: string, payload: any) => {
    const edges = getEdges();
    const nodes = getNodes();
    const outgoingEdges = edges.filter(e => e.source === sourceId);
    
    for (const edge of outgoingEdges) {
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!targetNode) continue;

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
          const modelToUse = targetNode.data.model || targetNode.type;
          const systemInstruction = targetNode.data.systemMessage;

          result = await generateText(payload, modelToUse, { systemInstruction });
          updateNodeStatus(targetNode.id, { status: 'completed', value: result });
        } 
        else if (
            targetNode.type === NodeType.CLAUDE_AGENT ||
            targetNode.type === NodeType.DEEPSEEK_AGENT ||
            targetNode.type === NodeType.OPENAI_AGENT ||
            targetNode.type === NodeType.MISTRAL_AGENT
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
          
          let modelId = 'gemini-2.5-flash-image'; 
          if (targetNode.type === NodeType.NANO_BANANA_PRO) {
               modelId = 'gemini-3-pro-image-preview';
          }

          result = await generateImage(payload, modelId, { aspectRatio, resolution });
          updateNodeStatus(targetNode.id, { status: 'completed', value: result, imageUrl: result });
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
        await processNodeChildren(targetNode.id, result);

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
      const promptInputs = nodes.filter(n => n.type === NodeType.PROMPT_INPUT);
      const videoInputs = nodes.filter(n => n.type === NodeType.VIDEO_UPLOAD);

      if (promptInputs.length === 0 && videoInputs.length === 0) {
          throw new Error("NO_INPUT_NODE");
      }

      for (const inputNode of promptInputs) {
        const promptText = inputNode.data.value;

        if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') {
            updateNodeStatus(inputNode.id, { status: 'error' });
            throw new Error("VALIDATION_ERROR");
        }

        updateNodeStatus(inputNode.id, { status: 'completed' });
        await processNodeChildren(inputNode.id, promptText);
      }

      for (const videoNode of videoInputs) {
        const videoPayload = videoNode.data.videoUrl || videoNode.data.value;
        if (!videoPayload || typeof videoPayload !== 'string' || videoPayload.trim() === '') {
            updateNodeStatus(videoNode.id, { status: 'error' });
            continue;
        }

        updateNodeStatus(videoNode.id, { status: 'completed' });
        await processNodeChildren(videoNode.id, videoPayload);
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
