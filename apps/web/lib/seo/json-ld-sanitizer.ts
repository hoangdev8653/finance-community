/**
 * XSS-Safe JSON-LD Serializer
 *
 * Sanitizes JSON strings intended for `<script type="application/ld+json">` tags
 * by escaping HTML-sensitive and unicode line separator characters:
 *
 * - `<`  -> `\u003c` (prevents closing </script> tags or opening HTML tags)
 * - `>`  -> `\u003e`
 * - `&`  -> `\u0026`
 * - `\u2028` -> `\u2028` (prevents JavaScript parse errors in string literals)
 * - `\u2029` -> `\u2029`
 *
 * @param data - Any JavaScript object, array, or primitive to serialize into JSON-LD
 * @returns Sanitized JSON string safe for raw embedding inside `<script>` elements
 */
export function safeJsonLdReplacer(data: unknown): string {
  const jsonString = JSON.stringify(data);

  if (typeof jsonString !== 'string') {
    return '{}';
  }

  return jsonString
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
