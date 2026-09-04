import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSiteUrl, getSiteUrlObject, buildCanonicalUrl, siteConfig } from '@/lib/seo/site-config';

describe('SEO Site Config & Canonical URL Resolver', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses NEXT_PUBLIC_SITE_URL when set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-domain.com/';
    expect(getSiteUrl()).toBe('https://custom-domain.com');
  });

  it('falls back to VERCEL_PROJECT_PRODUCTION_URL when NEXT_PUBLIC_SITE_URL is absent', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'finance-pulse.vercel.app';
    expect(getSiteUrl()).toBe('https://finance-pulse.vercel.app');
  });

  it('falls back to VERCEL_URL when production project url is absent', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    process.env.VERCEL_URL = 'preview-branch.vercel.app';
    expect(getSiteUrl()).toBe('https://preview-branch.vercel.app');
  });

  it('returns localhost:3000 in test/development environment without custom env vars', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
    (process.env as any).NODE_ENV = 'test';
    expect(getSiteUrl()).toBe('http://localhost:3000');
  });

  it('returns production fallback URL in production environment without env vars', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
    (process.env as any).NODE_ENV = 'production';
    expect(getSiteUrl()).toBe('https://morningview.community');
  });

  it('getSiteUrlObject() returns valid URL instance', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://morningview.community';
    const urlObj = getSiteUrlObject();
    expect(urlObj).toBeInstanceOf(URL);
    expect(urlObj.origin).toBe('https://morningview.community');
  });

  it('buildCanonicalUrl strips query params and normalizes slashes', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://morningview.community';

    expect(buildCanonicalUrl('/')).toBe('https://morningview.community');
    expect(buildCanonicalUrl('/posts/community/test-slug?sort=recent#heading')).toBe(
      'https://morningview.community/posts/community/test-slug'
    );
    expect(buildCanonicalUrl('series/market-curriculum/')).toBe(
      'https://morningview.community/series/market-curriculum'
    );
  });
});
