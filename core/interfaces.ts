export interface TextGenerator {
  /**
   * Gera texto a partir de um prompt e modelo.
   */
  generate(prompt: string, model: string, options?: { systemInstruction?: string }): Promise<string>;
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
