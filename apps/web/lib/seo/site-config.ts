import type { SiteConfig } from '../../types/seo';

/**
 * Determine the canonical public base URL for the application.
 *
 * Resolution Priority:
 * 1. NEXT_PUBLIC_SITE_URL
 * 2. VERCEL_PROJECT_PRODUCTION_URL (prefixed with https://)
 * 3. VERCEL_URL (prefixed with https://)
 * 4. In development/test environments (NODE_ENV !== 'production'): http://localhost:3000
 * 5. Production default fallback: https://financepulse.community
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    const url = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    return (url.startsWith('http') ? url : `https://${url}`).replace(/\/+$/, '');
  }

  if (process.env.VERCEL_URL) {
    const url = process.env.VERCEL_URL;
    return (url.startsWith('http') ? url : `https://${url}`).replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return 'http://localhost:3000';
  }

  return 'https://financepulse.community';
}

/**
 * Returns the site URL as a URL object for metadataBase.
 */
export function getSiteUrlObject(): URL {
  return new URL(getSiteUrl());
}

/**
 * Global site identity defaults.
 */
export const siteConfig: SiteConfig = {
  name: 'Finance Pulse',
  shortName: 'FinancePulse',
  description:
    'Nền tảng kiến thức & cộng đồng tài chính chuyên sâu về nghiên cứu thị trường, mô hình định giá và phân tích chuyên gia.',
  get url() {
    return getSiteUrl();
  },
  ogImage: '/images/og-default.png',
  twitterHandle: '@financepulse',
  locale: 'vi_VN',
};

/**
 * Construct a clean, deterministic, absolute canonical URL.
 *
 * Rules:
 * - Always returns an absolute URL starting with getSiteUrl().
 * - Strips all query parameters and hash fragments.
 * - Normalizes leading/trailing slashes (no trailing slash).
 * - Preserves root path as clean URL without trailing slash.
 *
 * @param path - Relative or absolute path segment (e.g. "/posts/community/valuation-multiples?sort=latest")
 */
export function buildCanonicalUrl(path: string = '/'): string {
  const baseUrl = getSiteUrl();

  // Strip query strings and hashes
  const cleanPath = path.split('?')[0].split('#')[0];

  // Normalize slashes: ensure single leading slash and remove trailing slashes
  const formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  const trimmedPath = formattedPath === '/' ? '' : formattedPath.replace(/\/+$/, '');

  return `${baseUrl}${trimmedPath}`;
}
