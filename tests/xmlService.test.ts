import { describe, it, expect } from 'vitest';
import { parseXml, validateXml } from '../services/xmlService';

describe('xmlService', () => {
  it('parses XML into object and supports XPath', () => {
    const xml = `<root><item id="a">foo</item><item id="b">42</item></root>`;
    const res = parseXml(xml, { xpath: 'string(/root/item[2]/@id)' });
    expect(res.errors.length).toBe(0);
    expect(res.doc).toBeTruthy();
    expect(res.object).toBeDefined();
    expect(res.object.item.length).toBe(2);
    expect(res.object.item[0]['@'].id).toBe('a');
    expect(res.object.item[1]['#']).toBe('42');
    expect(res.xpathResult).toBe('b');
  });

  it('evaluates XPath with namespaces', () => {
    const xml = `<ns:root xmlns:ns="http://example.com"><ns:val>ok</ns:val></ns:root>`;
    const res = parseXml(xml, { xpath: 'string(/ns:root/ns:val)', namespaces: { ns: 'http://example.com' } });
    expect(res.errors.length).toBe(0);
    expect(res.xpathResult).toBe('ok');
  });

  it('reports parse errors for invalid XML', () => {
    const bad = `<root><unclosed></root>`;
    const res = parseXml(bad);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('validates XPath rules for int/decimal/boolean', () => {
    const xml = `<root><i>10</i><d>3.14</d><b>true</b></root>`;
    const result = validateXml(xml, {
      paths: [
        { path: '/root/i', type: 'int' },
        { path: '/root/d', type: 'decimal' },
        { path: '/root/b', type: 'boolean' },
      ],
    });
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('fails validation when XPath not found or type mismatch', () => {
    const xml = `<root><i>abc</i></root>`;
    const result = validateXml(xml, {
      paths: [
        { path: '/root/missing', type: 'int' },
        { path: '/root/i', type: 'int' },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.startsWith('PATH_NOT_FOUND:'))).toBe(true);
    expect(result.errors.includes('TYPE:/root/i:int')).toBe(true);
  });

  it('performs basic XSD-based checks', () => {
    const xml = `<root><val>abc</val></root>`;
    const xsd = `
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" targetNamespace="http://example.com" xmlns="http://www.w3.org/2001/XMLSchema">
        <xsd:element name="root">
          <xsd:complexType>
            <xsd:sequence>
              <xsd:element name="val" type="xsd:int" minOccurs="1" />
            </xsd:sequence>
          </xsd:complexType>
        </xsd:element>
      </xsd:schema>
    `;
    const result = validateXml(xml, { schemaType: 'xsd', schema: xsd });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e === 'TYPE:val:int' || e.endsWith(':int'))).toBe(true);
    expect(result.report.rootElement).toBe('root');
  });
});
