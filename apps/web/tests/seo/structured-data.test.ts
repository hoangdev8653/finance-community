import { describe, it, expect } from 'vitest';
import {
  generateWebSiteJsonLd,
  generateOrganizationJsonLd,
  generateArticleJsonLd,
  generateSeriesItemListJsonLd,
  generateProfileJsonLd,
  generateBreadcrumbsJsonLd,
  generateCollectionPageJsonLd,
} from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/seo/site-config';
import type { PostDetailResponse } from '@/types/content';
import type { SeriesDetailResponse } from '@/types/series';
import type { PublicProfile } from '@/types/users';

describe('Schema.org Structured Data Generators', () => {
  it('generateWebSiteJsonLd() produces valid WebSite entity with SearchAction', () => {
    const jsonLd = generateWebSiteJsonLd();

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('WebSite');
    expect(jsonLd.name).toBe(siteConfig.name);
    expect(jsonLd.url).toBe(siteConfig.url);
    expect(jsonLd.potentialAction).toBeDefined();
  });

  it('generateOrganizationJsonLd() produces valid Organization entity', () => {
    const jsonLd = generateOrganizationJsonLd();

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('Organization');
    expect(jsonLd.name).toBe(siteConfig.name);
    expect(jsonLd.url).toBe(siteConfig.url);
    expect(jsonLd.logo).toBe(`${siteConfig.url}/images/logo.png`);
  });

  it('generateArticleJsonLd() creates NewsArticle for community post', () => {
    const mockPost: PostDetailResponse = {
      id: 'post-1',
      authorId: 'user-1',
      contentType: 'COMMUNITY',
      title: 'Discounted Cash Flow in Tech Valuations',
      slug: 'dcf-tech-valuations',
      body: 'Detailed research content...',
      coverMediaId: 'media-1',
      categoryId: 'cat-1',
      status: 'PUBLISHED',
      metaTitle: 'Tech DCF Models',
      metaDescription: 'Step by step DCF guide.',
      viewCount: 150,
      publishedAt: '2026-08-10T10:00:00Z',
      createdAt: '2026-08-10T09:00:00Z',
      updatedAt: '2026-08-12T14:00:00Z',
      deletedAt: null,
      tags: [{ id: 't1', name: 'Valuation', slug: 'valuation' }],
      media: [
        {
          id: 'media-1',
          secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          purpose: 'COVER',
          sortOrder: 0,
        },
      ],
    };

    const jsonLd = generateArticleJsonLd(mockPost);

    expect(jsonLd['@type']).toBe('NewsArticle');
    expect(jsonLd.headline).toBe('Discounted Cash Flow in Tech Valuations');
    expect(jsonLd.description).toBe('Step by step DCF guide.');
    expect(jsonLd.datePublished).toBe('2026-08-10T10:00:00Z');
    expect(jsonLd.dateModified).toBe('2026-08-12T14:00:00Z');
    expect(jsonLd.image).toEqual([
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    ]);
  });

  it('generateArticleJsonLd() creates EducationalArticle for series post', () => {
    const mockSeriesPost: PostDetailResponse = {
      id: 'post-2',
      authorId: 'user-1',
      contentType: 'SERIES',
      title: 'Chapter 1: Multiples Basics',
      slug: 'multiples-basics',
      body: 'Chapter text...',
      coverMediaId: null,
      categoryId: 'cat-1',
      status: 'PUBLISHED',
      metaTitle: null,
      metaDescription: null,
      viewCount: 45,
      publishedAt: '2026-08-15T10:00:00Z',
      createdAt: '2026-08-15T09:00:00Z',
      updatedAt: '2026-08-15T09:00:00Z',
      deletedAt: null,
      tags: [],
      media: [],
    };

    const jsonLd = generateArticleJsonLd(mockSeriesPost);
    expect(jsonLd['@type']).toBe('EducationalArticle');
  });

  it('generateSeriesItemListJsonLd() produces structured ItemList with items', () => {
    const mockSeries: SeriesDetailResponse = {
      series: {
        id: 's-1',
        name: 'Fixed Income Fundamentals',
        slug: 'fixed-income-fundamentals',
        description: 'Bond mathematics and yield curve dynamics.',
        sortOrder: 1,
        createdAt: '2026-08-01T00:00:00Z',
      },
      articles: [
        {
          id: 'art-1',
          title: 'Yield Curve Inversions',
          slug: 'yield-curve-inversions',
          status: 'PUBLISHED',
          publishedAt: '2026-08-02T00:00:00Z',
          viewCount: 100,
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    const jsonLd = generateSeriesItemListJsonLd(mockSeries);

    expect(jsonLd['@type']).toBe('ItemList');
    expect(jsonLd.name).toBe('Fixed Income Fundamentals');
    expect(jsonLd.numberOfItems).toBe(1);
    expect((jsonLd.itemListElement as any[])[0].position).toBe(1);
    expect((jsonLd.itemListElement as any[])[0].name).toBe('Yield Curve Inversions');
  });

  it('generateProfileJsonLd() produces ProfilePage with Person entity', () => {
    const mockProfile: PublicProfile = {
      id: 'prof-1',
      userId: 'user-1',
      username: 'johndoe',
      displayName: 'John Doe',
      avatarMediaId: null,
      bio: 'Senior Equity Analyst focusing on semiconductors.',
      createdAt: '2026-01-01T00:00:00Z',
    };

    const jsonLd = generateProfileJsonLd(mockProfile);

    expect(jsonLd['@type']).toBe('ProfilePage');
    const person = jsonLd.mainEntity as any;
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('John Doe');
    expect(person.identifier).toBe('johndoe');
    expect(person.description).toBe('Senior Equity Analyst focusing on semiconductors.');
  });

  it('generateBreadcrumbsJsonLd() produces valid BreadcrumbList', () => {
    const breadcrumbs = generateBreadcrumbsJsonLd([
      { name: 'Home', url: '/' },
      { name: 'Educational Series', url: '/series' },
      { name: 'Curriculum', url: '/series/curriculum' },
    ]);

    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    const items = breadcrumbs.itemListElement as any[];
    expect(items).toHaveLength(3);
    expect(items[0].position).toBe(1);
    expect(items[0].name).toBe('Home');
    expect(items[1].position).toBe(2);
    expect(items[2].position).toBe(3);
  });

  it('generateCollectionPageJsonLd() produces valid CollectionPage entity', () => {
    const collection = generateCollectionPageJsonLd('All Series', 'List of series', '/series');
    expect(collection['@type']).toBe('CollectionPage');
    expect(collection.name).toBe('All Series');
    expect(collection.url).toBe(`${siteConfig.url}/series`);
  });
});
