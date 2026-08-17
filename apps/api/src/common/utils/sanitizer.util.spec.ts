import { SanitizerUtil } from './sanitizer.util';

describe('SanitizerUtil', () => {
  describe('sanitizeRichText', () => {
    it('should strip <script> tags and their inner content', () => {
      const input = '<p>Hello</p><script>alert("XSS")</script>';
      const result = SanitizerUtil.sanitizeRichText(input);
      expect(result).toBe('<p>Hello</p>');
    });

    it('should strip inline event handlers like onerror and onclick', () => {
      const input = '<img src="x" onerror="alert(1)" /><button onclick="doBad()">Click</button>';
      const result = SanitizerUtil.sanitizeRichText(input);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('onclick');
    });

    it('should strip javascript: URLs from href attributes', () => {
      const input = '<a href="javascript:alert(1)">Unsafe Link</a><a href="https://example.com">Safe Link</a>';
      const result = SanitizerUtil.sanitizeRichText(input);
      expect(result).not.toContain('javascript:');
      expect(result).toContain('href="https://example.com"');
    });

    it('should handle malformed and nested HTML tags safely', () => {
      const input = '<div><p>Nested <b>bold <script>bad()</script> content</b></p></div>';
      const result = SanitizerUtil.sanitizeRichText(input);
      expect(result).toContain('Nested <b>bold  content</b>');
      expect(result).not.toContain('<script>');
    });

    it('should preserve safe formatting tags and allowed attributes', () => {
      const input = '<p class="text-bold">Paragraph with <strong>strong</strong> and <em>emphasis</em></p>';
      const result = SanitizerUtil.sanitizeRichText(input);
      expect(result).toBe('<p class="text-bold">Paragraph with <strong>strong</strong> and <em>emphasis</em></p>');
    });

    it('should return empty string when empty input is provided', () => {
      expect(SanitizerUtil.sanitizeRichText('')).toBe('');
    });
  });

  describe('stripAllTags', () => {
    it('should strip all HTML tags from plaintext input', () => {
      const input = '<h1>Title</h1><p>Body <span>text</span></p>';
      const result = SanitizerUtil.stripAllTags(input);
      expect(result).toBe('TitleBody text');
    });

    it('should return empty string when empty input is provided', () => {
      expect(SanitizerUtil.stripAllTags('')).toBe('');
    });
  });
});
