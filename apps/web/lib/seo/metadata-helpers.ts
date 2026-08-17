import type { Metadata } from 'next';
import { siteConfig, buildCanonicalUrl } from './site-config';
import type { PageMetadataOptions } from '../../types/seo';

/**
 * Construct typed, consistent Next.js Metadata for any application route.
 *
 * Merges route-specific overrides with global siteConfig defaults.
 */
export function buildPageMetadata(options: PageMetadataOptions = {}): Metadata {
  const {
    title,
    description = siteConfig.description,
    canonicalPath,
    ogType = 'website',
    ogImage = siteConfig.ogImage,
    twitterCard = 'summary_large_image',
    publishedTime,
    modifiedTime,
    authors,
    tags,
    noIndex = false,
    noFollow = false,
  } = options;

  const canonicalUrl = canonicalPath ? buildCanonicalUrl(canonicalPath) : undefined;
  const resolvedTitle = title ? title : siteConfig.name;

  const metadata: Metadata = {
    title,
    description,
  };

  if (canonicalUrl) {
    metadata.alternates = {
      canonical: canonicalUrl,
    };
  }

  // Open Graph
  metadata.openGraph = {
    title: resolvedTitle,
    description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: ogType,
    url: canonicalUrl,
    images: ogImage ? [{ url: ogImage }] : undefined,
    publishedTime,
    modifiedTime,
    authors,
    tags,
  };

  // Twitter Card
  metadata.twitter = {
    card: twitterCard,
    title: resolvedTitle,
    description,
    images: ogImage ? [ogImage] : undefined,
    creator: siteConfig.twitterHandle,
  };

  // Robots directives
  if (noIndex || noFollow) {
    metadata.robots = {
      index: !noIndex,
      follow: !noFollow,
    };
  }

  return metadata;
}
