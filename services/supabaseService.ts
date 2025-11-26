import { SupabaseClient } from '../core/interfaces';

export const createSupabaseClient = (): SupabaseClient => {
  const buildRequest: SupabaseClient['buildRequest'] = (baseUrl, apiKey, table, op, payloadObj, prevPayload) => {
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

  const execute: SupabaseClient['execute'] = async (req) => {
    const resp = await fetch(req.url, { method: req.method, headers: req.headers, body: req.body });
    const text = await resp.text();
    try { return JSON.parse(text); } catch { return text; }
  };

  return { buildRequest, execute };
};
