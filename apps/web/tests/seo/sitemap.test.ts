import { describe, it, expect, vi, beforeEach } from 'vitest';
import sitemap from '@/app/sitemap';
import { postsService } from '@/lib/posts/posts-service';
import { seriesService } from '@/lib/series/series-service';
import { searchService } from '@/lib/search/search-service';
import { getSiteUrl } from '@/lib/seo/site-config';

vi.mock('@/lib/posts/posts-service');
vi.mock('@/lib/series/series-service');
vi.mock('@/lib/search/search-service');

describe('Dynamic Sitemap Generator', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('includes static core routes, posts, series, and tags', async () => {
    const baseUrl = getSiteUrl();

    vi.mocked(postsService.getFeed).mockResolvedValueOnce({
      data: [
        {
          id: 'p1',
          slug: 'valuation-analysis',
          contentType: 'COMMUNITY',
          status: 'PUBLISHED',
          updatedAt: '2026-08-15T00:00:00Z',
          createdAt: '2026-08-10T00:00:00Z',
        } as any,
      ],
      meta: { page: 1, limit: 100, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });
    vi.mocked(postsService.getDomains).mockResolvedValueOnce([]);

    vi.mocked(seriesService.getAllSeries).mockResolvedValueOnce({
      data: [
        {
          id: 's1',
          name: 'Fixed Income',
          slug: 'fixed-income',
          createdAt: '2026-08-01T00:00:00Z',
        } as any,
      ],
      meta: { page: 1, limit: 50, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });

    vi.mocked(searchService.searchTags).mockResolvedValueOnce([
      { id: 't1', name: 'Macro', slug: 'macro', usageCount: 5, createdAt: '2026-08-01T00:00:00Z' },
    ]);

    const result = await sitemap();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: `${baseUrl}` }),
        expect.objectContaining({ url: `${baseUrl}/series` }),
        expect.objectContaining({
          url: `${baseUrl}/posts/community/valuation-analysis`,
          priority: 0.9,
        }),
        expect.objectContaining({
          url: `${baseUrl}/series/fixed-income`,
          priority: 0.8,
        }),
        expect.objectContaining({
          url: `${baseUrl}/tags/macro`,
          priority: 0.6,
        }),
      ])
    );
  });

  it('handles backend service failure gracefully and returns static routes', async () => {
    const baseUrl = getSiteUrl();

    vi.mocked(postsService.getFeed).mockRejectedValueOnce(new Error('Network error'));
    vi.mocked(postsService.getDomains).mockRejectedValueOnce(new Error('Network error'));
    vi.mocked(seriesService.getAllSeries).mockRejectedValueOnce(new Error('Network error'));
    vi.mocked(searchService.searchTags).mockRejectedValueOnce(new Error('Network error'));

    const result = await sitemap();

    expect(result.length).toBeGreaterThanOrEqual(5);
    expect(result.map((r) => r.url)).toEqual([
      `${baseUrl}`,
      `${baseUrl}/posts`,
      `${baseUrl}/categories`,
      `${baseUrl}/tags`,
      `${baseUrl}/series`,
    ]);
  });
});
