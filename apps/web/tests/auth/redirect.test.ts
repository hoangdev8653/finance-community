import { describe, it, expect } from 'vitest';
import { sanitizeRedirectUrl } from '@/lib/auth/redirect';

describe('Redirect URL Sanitizer', () => {
  it('accepts safe internal relative paths', () => {
    expect(sanitizeRedirectUrl('/dashboard')).toBe('/dashboard');
    expect(sanitizeRedirectUrl('/posts/create')).toBe('/posts/create');
    expect(sanitizeRedirectUrl('/settings?tab=profile&view=compact')).toBe('/settings?tab=profile&view=compact');
  });

  it('rejects external URL schemes', () => {
    expect(sanitizeRedirectUrl('https://evil.com')).toBe('/');
    expect(sanitizeRedirectUrl('http://evil.com')).toBe('/');
    expect(sanitizeRedirectUrl('ftp://evil.com')).toBe('/');
  });

  it('rejects protocol-relative and backslash bypass attempts', () => {
    expect(sanitizeRedirectUrl('//evil.com')).toBe('/');
    expect(sanitizeRedirectUrl('/\\evil.com')).toBe('/');
    expect(sanitizeRedirectUrl('\\\\evil.com')).toBe('/');
    expect(sanitizeRedirectUrl('/\\/evil.com')).toBe('/');
  });

  it('rejects script and data pseudo-protocols', () => {
    expect(sanitizeRedirectUrl('javascript:alert(1)')).toBe('/');
    expect(sanitizeRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe('/');
  });

  it('rejects encoded path traversal and bypass attempts', () => {
    expect(sanitizeRedirectUrl('/%2F%2Fevil.com')).toBe('/');
    expect(sanitizeRedirectUrl('/%2f%2fevil.com')).toBe('/');
    expect(sanitizeRedirectUrl('/%5C%5Cevil.com')).toBe('/');
    expect(sanitizeRedirectUrl('/%5c%5cevil.com')).toBe('/');
    expect(sanitizeRedirectUrl('/%3A//evil.com')).toBe('/');
  });

  it('falls back to custom fallback if provided', () => {
    expect(sanitizeRedirectUrl('https://evil.com', '/fallback')).toBe('/fallback');
    expect(sanitizeRedirectUrl(null, '/default')).toBe('/default');
  });
});
