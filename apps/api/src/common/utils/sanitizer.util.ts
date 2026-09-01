// eslint-disable-next-line @typescript-eslint/no-require-imports
import sanitizeHtml = require('sanitize-html');

export class SanitizerUtil {
  /**
   * Sanitizes rich text HTML content using AST DOM parsing with sanitize-html.
   * Removes script tags, event handlers (on*), javascript: URLs, and unsafe elements.
   */
  static sanitizeRichText(dirtyHtml: string): string {
    if (!dirtyHtml) return '';

    return sanitizeHtml(dirtyHtml, {
      allowedTags: [
        'p',
        'br',
        'b',
        'i',
        'strong',
        'em',
        'a',
        'ul',
        'ol',
        'li',
        'blockquote',
        'code',
        'pre',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'span',
        'div',
        'img',
        'figure',
        'figcaption',
      ],
      allowedAttributes: {
        a: ['href', 'name', 'target', 'rel', 'title'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        '*': ['class'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesByTag: {
        a: ['http', 'https', 'mailto'],
      },
      allowProtocolRelative: false,
      disallowedTagsMode: 'discard',
    }).trim();
  }

  /**
   * Strips all HTML tags from plaintext fields.
   */
  static stripAllTags(dirtyText: string): string {
    if (!dirtyText) return '';

    return sanitizeHtml(dirtyText, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'discard',
    }).trim();
  }
}
