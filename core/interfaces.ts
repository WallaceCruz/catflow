export interface TextGenerator {
  generate(prompt: string, model: string, options?: { systemInstruction?: string; temperature?: number; maxTokens?: number; timeoutMs?: number; useCache?: boolean }): Promise<string>;
}

export interface ImageGenerator {
  /**
   * Gera imagem a partir de prompt e modelo.
   */
  generate(prompt: string, model: string, options?: { aspectRatio?: string; resolution?: string }): Promise<string>;
}

export interface SupabaseClient {
  /**
   * Constrói requisição HTTP para a REST API do Supabase.
   */
  buildRequest(baseUrl: string, apiKey: string, table: string, op: string, payloadObj: any, prevPayload: any): {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
  };
  /**
   * Executa a requisição e retorna resultado parseado.
   */
  execute(req: { url: string; method: string; headers: Record<string, string>; body?: string }): Promise<any>;
}

export interface RedisClient {
  /**
   * Executa comando remoto compatível com Upstash/Redis REST.
   */
  execute(host: string, token: string, action: 'GET' | 'SET' | 'DEL', key: string, value?: string): Promise<any>;
}

export interface Cache {
  /** Obtém valor do cache. */ get(key: string): string | undefined;
  /** Define valor no cache. */ set(key: string, value: string): void;
}

export interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export interface HttpClient {
  request(opts: { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; url: string; headers?: Record<string, string>; params?: Record<string, any>; body?: string; timeoutMs?: number }): Promise<{ ok: boolean; status: number; headers: Record<string, string>; text: string; json?: any; xml?: any }>;
}

/**
 * Builder e validador de requisições HTTP a partir de dados do nó.
 * Responsável por montar headers (incluindo Authorization), query params,
 * corpo da requisição e aplicar validações de segurança.
 */
export interface HttpRequestBuilder {
  build(input: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    body?: string;
    timeoutMs?: number;
    tokenType?: string;
    accessToken?: string;
    pairs?: Array<{ key: string; value: string }>;
  }): {
    valid: boolean;
    reason?: string;
    options: { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; url: string; headers: Record<string, string>; params: Record<string, any>; body?: string; timeoutMs?: number };
  };
}
