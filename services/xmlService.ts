export type NamespaceMap = Record<string, string>;

export interface ParseOptions {
  namespaces?: NamespaceMap;
  xpath?: string;
}

export interface ParseResult {
  doc: Document | null;
  object?: any;
  xpathResult?: any;
  errors: string[];
}

const isElement = (n: Node): n is Element => n.nodeType === 1;

export const xmlToObject = (node: Node): any => {
  if (node.nodeType === 3) {
    const t = String(node.nodeValue || '').trim();
    return t.length ? t : undefined;
  }
  if (!isElement(node)) return undefined;
  const el = node as Element;
  const obj: any = {};
  const attrs: Record<string, string> = {};
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes.item(i);
    if (!a) continue;
    attrs[a.name] = a.value;
  }
  if (Object.keys(attrs).length) obj['@'] = attrs;
  const children: Record<string, any[]> = {};
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes.item(i);
    const co = xmlToObject(child);
    if (co === undefined) continue;
    if (isElement(child)) {
      const key = child.localName || child.nodeName;
      if (!children[key]) children[key] = [];
      children[key].push(co);
    } else {
      if (typeof co === 'string' && co.length) {
        obj['#'] = co;
      }
    }
  }
  for (const k of Object.keys(children)) {
    const arr = children[k];
    obj[k] = arr.length === 1 ? arr[0] : arr;
  }
  return obj;
};

const makeNsResolver = (namespaces?: NamespaceMap) => {
  const ns = namespaces || {};
  return (prefix: string) => ns[prefix] || null;
};

export const parseXml = (xml: string, opts: ParseOptions = {}): ParseResult => {
  const errors: string[] = [];
  if (!xml || typeof xml !== 'string') return { doc: null, errors: ['EMPTY_INPUT'] };
  let doc: Document | null = null;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(xml, 'application/xml');
    const perr = doc.getElementsByTagName('parsererror')[0];
    if (perr) {
      errors.push('PARSE_ERROR');
    }
  } catch (e: any) {
    errors.push(String(e?.message || 'PARSE_FAILED'));
  }
  if (!doc) return { doc: null, errors };
  let object: any = undefined;
  try {
    const root = doc.documentElement;
    object = xmlToObject(root);
  } catch {}
  let xpathResult: any = undefined;
  if (opts.xpath) {
    try {
      const res = doc.evaluate(opts.xpath, doc, makeNsResolver(opts.namespaces), XPathResult.ANY_TYPE, null);
      switch (res.resultType) {
        case XPathResult.STRING_TYPE:
          xpathResult = res.stringValue;
          break;
        case XPathResult.NUMBER_TYPE:
          xpathResult = res.numberValue;
          break;
        case XPathResult.BOOLEAN_TYPE:
          xpathResult = res.booleanValue;
          break;
        default: {
          const nodes: string[] = [];
          let n = res.iterateNext();
          while (n) {
            if (isElement(n)) {
              nodes.push((n as Element).outerHTML);
            } else {
              nodes.push(n.nodeValue || '');
            }
            n = res.iterateNext();
          }
          xpathResult = nodes;
        }
      }
    } catch {
      errors.push('XPATH_ERROR');
    }
  }
  return { doc, object, xpathResult, errors };
};

export interface ValidationPathRule {
  path: string;
  type?: 'string' | 'int' | 'decimal' | 'boolean';
}

export interface ValidateOptions {
  schemaType?: 'xsd' | 'dtd' | 'none';
  schema?: string;
  paths?: ValidationPathRule[];
  namespaces?: NamespaceMap;
}

export interface ValidateResult {
  valid: boolean;
  errors: string[];
  report: Record<string, any>;
}

const isInt = (v: string) => /^[-+]?\d+$/.test(v);
const isDecimal = (v: string) => /^[-+]?\d+(\.\d+)?$/.test(v);
const isBool = (v: string) => /^(true|false|0|1)$/i.test(v);

export const validateXml = (xml: string, opts: ValidateOptions = {}): ValidateResult => {
  const report: Record<string, any> = {};
  const errors: string[] = [];
  const parsed = parseXml(xml);
  if (!parsed.doc || parsed.errors.length) {
    errors.push(...parsed.errors);
    return { valid: false, errors, report };
  }
  const doc = parsed.doc;
  if (opts.schemaType === 'xsd' && opts.schema) {
    try {
      const sres = parseXml(opts.schema);
      if (!sres.doc || sres.errors.length) {
        errors.push('SCHEMA_PARSE_ERROR');
      } else {
        const schemaDoc = sres.doc;
        const schemaEl = schemaDoc.documentElement;
        const tns = schemaEl.getAttribute('targetNamespace') || '';
        const rootName = doc.documentElement.localName || doc.documentElement.nodeName;
        report.targetNamespace = tns;
        report.rootElement = rootName;
        const elements: Array<{ name: string; minOccurs: number; type?: string }> = [];
        const allEls = Array.from(schemaDoc.getElementsByTagName('*'));
        for (const e of allEls) {
          const ln = e.localName || e.nodeName;
          if (ln.toLowerCase() === 'element') {
            const name = e.getAttribute('name') || '';
            const mo = parseInt(e.getAttribute('minOccurs') || '1', 10) || 1;
            const type = e.getAttribute('type') || undefined;
            if (name) elements.push({ name, minOccurs: mo, type });
          }
        }
        for (const el of elements) {
          const found = doc.getElementsByTagName(el.name).length;
          if (found < el.minOccurs) {
            errors.push(`MISSING:${el.name}`);
          }
          if (el.type) {
            const nodes = Array.from(doc.getElementsByTagName(el.name));
            for (const n of nodes) {
              const val = (n.textContent || '').trim();
              if (!val.length) continue;
              if (el.type.endsWith('int') && !isInt(val)) errors.push(`TYPE:${el.name}:int`);
              else if (el.type.endsWith('decimal') && !isDecimal(val)) errors.push(`TYPE:${el.name}:decimal`);
              else if (el.type.endsWith('boolean') && !isBool(val)) errors.push(`TYPE:${el.name}:boolean`);
            }
          }
        }
      }
    } catch {
      errors.push('SCHEMA_ERROR');
    }
  }
  if (Array.isArray(opts.paths)) {
    for (const rule of opts.paths) {
      try {
        const res = doc.evaluate(rule.path, doc, makeNsResolver(opts.namespaces), XPathResult.ANY_TYPE, null);
        let values: string[] = [];
        switch (res.resultType) {
          case XPathResult.STRING_TYPE:
            values = [res.stringValue];
            break;
          case XPathResult.NUMBER_TYPE:
            values = [String(res.numberValue)];
            break;
          case XPathResult.BOOLEAN_TYPE:
            values = [String(res.booleanValue)];
            break;
          default: {
            const nodes: Node[] = [];
            let n = res.iterateNext();
            while (n) { nodes.push(n); n = res.iterateNext(); }
            values = nodes.map((n) => (n.textContent || '').trim());
          }
        }
        if (!values.length) {
          errors.push(`PATH_NOT_FOUND:${rule.path}`);
          continue;
        }
        if (rule.type) {
          for (const v of values) {
            if (rule.type === 'int' && !isInt(v)) errors.push(`TYPE:${rule.path}:int`);
            else if (rule.type === 'decimal' && !isDecimal(v)) errors.push(`TYPE:${rule.path}:decimal`);
            else if (rule.type === 'boolean' && !isBool(v)) errors.push(`TYPE:${rule.path}:boolean`);
          }
        }
      } catch {
        errors.push(`XPATH_RULE_ERROR:${rule.path}`);
      }
    }
  }
  return { valid: errors.length === 0, errors, report };
};
