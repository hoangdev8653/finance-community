/**
 * Hardened Open Redirect Sanitizer
 * Rejects external schemes, protocol-relative URLs, backslash bypasses, and encoded attack vectors.
 */
export function sanitizeRedirectUrl(url: string | null | undefined, fallback = '/'): string {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();

  // 1. Must start with a single forward slash
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.startsWith('\\')) {
    return fallback;
  }

  // 2. Reject explicit schemes, Windows drives, or encoded bypasses
  const lower = trimmed.toLowerCase();
  if (
    lower.includes(':') ||
    lower.includes('%2f') ||
    lower.includes('%5c') ||
    lower.includes('%3a') ||
    lower.includes('javascript') ||
    lower.includes('data')
  ) {
    return fallback;
  }

  // 3. Strict regex: only valid relative path, query, and hash characters
  if (!/^\/[a-zA-Z0-9_\-\/\.\?=\&%#]*$/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
