import { siteConfig, buildCanonicalUrl } from './site-config';
import type { SchemaOrgEntity, BreadcrumbItem } from '../../types/seo';
import type { PostDetailResponse } from '../../types/content';
import type { SeriesDetailResponse } from '../../types/series';
import type { PublicProfile } from '../../types/users';

/**
 * Generate Schema.org WebSite JSON-LD.
 */
export function generateWebSiteJsonLd(): SchemaOrgEntity {
  const siteUrl = siteConfig.url;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteUrl,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Schema.org Organization JSON-LD.
 */
export function generateOrganizationJsonLd(): SchemaOrgEntity {
  const siteUrl = siteConfig.url;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    sameAs: [
      `https://twitter.com/${siteConfig.twitterHandle.replace('@', '')}`,
    ],
  };
}

/**
 * Generate Schema.org Article (NewsArticle or EducationalArticle) JSON-LD.
 */
export function generateArticleJsonLd(post: PostDetailResponse): SchemaOrgEntity {
  const normalizedType = post.contentType.toLowerCase();
  const canonicalUrl = buildCanonicalUrl(`/posts/${normalizedType}/${encodeURIComponent(post.slug)}`);
  const isEducational = post.contentType === 'SERIES';

  const coverMedia = post.coverMediaId
    ? post.media.find((m) => m.id === post.coverMediaId)
    : post.media[0];

  return {
    '@context': 'https://schema.org',
    '@type': isEducational ? 'EducationalArticle' : 'NewsArticle',
    headline: post.title,
    description: post.metaDescription || post.title,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    url: canonicalUrl,
    image: coverMedia?.secureUrl ? [coverMedia.secureUrl] : undefined,
    keywords: post.tags?.map((t) => t.name).join(', '),
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/logo.png`,
      },
    },
  };
}

/**
 * Generate Schema.org ItemList JSON-LD for Educational Series.
 */
export function generateSeriesItemListJsonLd(seriesDetail: SeriesDetailResponse): SchemaOrgEntity {
  const canonicalUrl = buildCanonicalUrl(`/series/${encodeURIComponent(seriesDetail.series.slug)}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: seriesDetail.series.name,
    description: seriesDetail.series.description || '',
    url: canonicalUrl,
    numberOfItems: seriesDetail.meta?.totalItems ?? seriesDetail.articles.length,
    itemListElement: seriesDetail.articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: article.title,
      url: buildCanonicalUrl(`/posts/series/${encodeURIComponent(article.slug)}`),
    })),
  };
}

/**
 * Generate Schema.org ProfilePage / Person JSON-LD.
 */
export function generateProfileJsonLd(profile: PublicProfile): SchemaOrgEntity {
  const canonicalUrl = buildCanonicalUrl(`/profile/${encodeURIComponent(profile.username)}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profile.displayName || profile.username,
      alternateName: `@${profile.username}`,
      identifier: profile.username,
      description: profile.bio || '',
      url: canonicalUrl,
    },
  };
}

/**
 * Generate Schema.org BreadcrumbList JSON-LD.
 */
export function generateBreadcrumbsJsonLd(items: BreadcrumbItem[]): SchemaOrgEntity {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : buildCanonicalUrl(item.url),
    })),
  };
}

/**
 * Generate Schema.org CollectionPage JSON-LD.
 */
export function generateCollectionPageJsonLd(
  name: string,
  description: string,
  path: string
): SchemaOrgEntity {
  const canonicalUrl = buildCanonicalUrl(path);

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: canonicalUrl,
  };
}
