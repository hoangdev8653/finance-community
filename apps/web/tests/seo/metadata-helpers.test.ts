import { describe, it, expect } from 'vitest';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { siteConfig } from '@/lib/seo/site-config';

describe('SEO Metadata Helpers', () => {
  it('builds full metadata with all fields provided', () => {
    const meta = buildPageMetadata({
      title: 'Custom Title',
      description: 'Custom Description',
      canonicalPath: '/posts/community/test-slug',
      ogType: 'article',
      ogImage: 'https://images.cloudinary.com/test.jpg',
      twitterCard: 'summary_large_image',
      publishedTime: '2026-08-16T00:00:00Z',
      modifiedTime: '2026-08-16T12:00:00Z',
      tags: ['Macro', 'Equities'],
    });

    expect(meta.title).toBe('Custom Title');
    expect(meta.description).toBe('Custom Description');
    expect(meta.alternates?.canonical).toBe(
      `${siteConfig.url}/posts/community/test-slug`
    );

    // OpenGraph
    expect((meta.openGraph as any)?.title).toBe('Custom Title');
    expect((meta.openGraph as any)?.type).toBe('article');
    expect((meta.openGraph as any)?.url).toBe(`${siteConfig.url}/posts/community/test-slug`);
    expect(meta.openGraph?.images).toEqual([
      { url: 'https://images.cloudinary.com/test.jpg' },
    ]);

    // Twitter
    expect((meta.twitter as any)?.card).toBe('summary_large_image');
    expect(meta.twitter?.title).toBe('Custom Title');
  });

  it('uses default fallback values when minimal options are passed', () => {
    const meta = buildPageMetadata({});

    expect(meta.title).toBeUndefined();
    expect(meta.description).toBe(siteConfig.description);
    expect(meta.alternates?.canonical).toBeUndefined();
    expect((meta.openGraph as any)?.title).toBe(siteConfig.name);
    expect((meta.openGraph as any)?.type).toBe('website');
  });

  it('applies robots directives when noIndex or noFollow is true', () => {
    const noIndexMeta = buildPageMetadata({ noIndex: true });
    expect(noIndexMeta.robots).toEqual({ index: false, follow: true });

    const privateMeta = buildPageMetadata({ noIndex: true, noFollow: true });
    expect(privateMeta.robots).toEqual({ index: false, follow: false });

    const publicMeta = buildPageMetadata({ noIndex: false, noFollow: false });
    expect(publicMeta.robots).toBeUndefined();
  });
});
