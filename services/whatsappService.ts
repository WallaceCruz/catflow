export interface WhatsConfig {
  phone: string;
  apiKey: string;
  endpoint: string;
  proxyUrl?: string;
}

export interface WhatsClient {
  validateConfig: (conf: WhatsConfig) => { ok: boolean; errors: string[] };
  testConnection: (conf: WhatsConfig) => Promise<{ ok: boolean; status: number }>;
}

const isValidPhone = (v: string) => /^\+?\d{8,15}$/.test(v.trim());
const isValidUrl = (v: string) => {
  try { new URL(v); return true; } catch { return false; }
};

export const createWhatsAppClient = (): WhatsClient => {
  const validateConfig: WhatsClient['validateConfig'] = (conf) => {
    const errors: string[] = [];
    if (!isValidPhone(conf.phone)) errors.push('Número inválido');
    if (!conf.apiKey || conf.apiKey.trim().length < 8) errors.push('API Key inválida');
    if (!isValidUrl(conf.endpoint)) errors.push('Endpoint inválido');
    if (conf.proxyUrl && !isValidUrl(conf.proxyUrl)) errors.push('Proxy inválido');
    return { ok: errors.length === 0, errors };
  };

  const testConnection: WhatsClient['testConnection'] = async (conf) => {
    const v = validateConfig(conf);
    if (!v.ok) throw new Error('INVALID_CONFIG');
    const url = `${conf.endpoint.replace(/\/$/, '')}/status`;
    const headers: Record<string, string> = { Authorization: `Bearer ${conf.apiKey}` };
    const resp = await fetch(url, { method: 'GET', headers });
    return { ok: resp.ok, status: resp.status };
  };

  return { validateConfig, testConnection };
};
