import { describe, it, expect, vi, beforeEach } from 'vitest';
import { seriesService } from '@/lib/series/series-service';
import { apiClient } from '@/lib/api/client';

describe('Series Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getAllSeries() calls GET /series with query parameters', async () => {
    const mockResponse = {
      data: [
        {
          id: 'cat-series-1',
          name: 'Macroeconomic Frameworks',
          slug: 'macroeconomic-frameworks',
          description: 'Global macro analysis.',
          sortOrder: 1,
          publishedArticleCount: 5,
          createdAt: '2026-08-15T00:00:00Z',
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

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await seriesService.getAllSeries({ page: 1, limit: 20 });

    expect(getSpy).toHaveBeenCalledWith('/series', { params: { page: 1, limit: 20 } });
    expect(result).toEqual(mockResponse);
  });

  it('getBySlug() calls GET /series/:slug with encoded slug and params', async () => {
    const mockDetailResponse = {
      series: {
        id: 'cat-series-1',
        name: 'Macroeconomic Frameworks',
        slug: 'macroeconomic-frameworks',
        description: 'Global macro analysis.',
        sortOrder: 1,
        createdAt: '2026-08-15T00:00:00Z',
      },
      articles: [
        {
          id: 'post-1',
          title: 'Chapter 1: Sovereign Yield Curves',
          slug: 'chapter-1-sovereign-yield-curves',
          status: 'PUBLISHED',
          publishedAt: '2026-08-15T00:00:00Z',
          viewCount: 140,
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

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockDetailResponse } as any);

    const result = await seriesService.getBySlug('macroeconomic-frameworks', { page: 1, limit: 20 });

    expect(getSpy).toHaveBeenCalledWith('/series/macroeconomic-frameworks', {
      params: { page: 1, limit: 20 },
    });
    expect(result).toEqual(mockDetailResponse);
  });
});
