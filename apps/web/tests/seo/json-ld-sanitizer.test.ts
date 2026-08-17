import { describe, it, expect } from 'vitest';
import { safeJsonLdReplacer } from '@/lib/seo/json-ld-sanitizer';

describe('JSON-LD XSS Sanitizer', () => {
  it('serializes standard objects to valid JSON', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Market Valuation Masterclass',
    };

    const sanitized = safeJsonLdReplacer(data);
    expect(JSON.parse(sanitized)).toEqual(data);
  });

  it('escapes closing </script> tags to prevent script injection', () => {
    const malicious = {
      title: 'Breaking News</script><script>alert("xss")</script>',
    };

    const sanitized = safeJsonLdReplacer(malicious);
    expect(sanitized).not.toContain('</script>');
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('\\u003c/script\\u003e');
    expect(sanitized).toContain('\\u003cscript\\u003e');

    // JSON.parse reverses unicode escape sequences safely
    expect(JSON.parse(sanitized)).toEqual(malicious);
  });

  it('escapes < and > characters in strings', () => {
    const data = {
      formula: 'P/E < 15 and ROE > 20%',
    };

    const sanitized = safeJsonLdReplacer(data);
    expect(sanitized).toContain('P/E \\u003c 15 and ROE \\u003e 20%');
    expect(JSON.parse(sanitized)).toEqual(data);
  });

  it('escapes & ampersands in strings', () => {
    const data = {
      brand: 'S&P 500 & Nasdaq',
    };

    const sanitized = safeJsonLdReplacer(data);
    expect(sanitized).toContain('S\\u0026P 500 \\u0026 Nasdaq');
    expect(JSON.parse(sanitized)).toEqual(data);
  });

  it('escapes unicode line separators \\u2028 and \\u2029', () => {
    const data = {
      text: 'Line 1\u2028Line 2\u2029Line 3',
    };

    const sanitized = safeJsonLdReplacer(data);
    expect(sanitized).toContain('\\u2028');
    expect(sanitized).toContain('\\u2029');
    expect(JSON.parse(sanitized)).toEqual(data);
  });

  it('handles null and undefined gracefully', () => {
    expect(safeJsonLdReplacer(null)).toBe('null');
    expect(safeJsonLdReplacer(undefined)).toBe('{}');
  });
});
