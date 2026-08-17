import type { Metadata } from 'next';

/**
 * Site configuration properties.
 */
export interface SiteConfig {
  name: string;
  shortName: string;
  description: string;
  url: string;
  ogImage: string;
  twitterHandle: string;
  locale: string;
}

/**
 * Breadcrumb item definition for UI and Schema.org BreadcrumbList.
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Options for constructing page-level metadata.
 */
export interface PageMetadataOptions {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
}

/**
 * Base Schema.org entity shape.
 */
export interface SchemaOrgEntity {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: unknown;
}
