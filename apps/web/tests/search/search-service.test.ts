import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchService } from '@/lib/search/search-service';
import { apiClient } from '@/lib/api/client';

describe('Search Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('searchTags() calls GET /tags with search query and limit', async () => {
    const mockTags = [
      { id: 't-1', name: 'macroeconomics', slug: 'macroeconomics', createdAt: '2026-08-16T00:00:00Z', updatedAt: '2026-08-16T00:00:00Z' },
    ];
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockTags,
    } as any);

    const tags = await searchService.searchTags('macro', 10);
    expect(getSpy).toHaveBeenCalledWith('/tags', {
      params: { search: 'macro', limit: 10 },
    });
    expect(tags).toEqual(mockTags);
  });

  it('getCategories() calls GET /categories with scope', async () => {
    const mockCategories = [
      { id: 'c-1', name: 'Fixed Income', slug: 'fixed-income', scope: 'SERIES', description: null, sortOrder: 0, createdAt: '2026-08-16T00:00:00Z', updatedAt: '2026-08-16T00:00:00Z' },
    ];
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockCategories,
    } as any);

    const categories = await searchService.getCategories('SERIES');
    expect(getSpy).toHaveBeenCalledWith('/categories', {
      params: { scope: 'SERIES' },
    });
    expect(categories).toEqual(mockCategories);
  });

  it('queryPosts() formats multi-dimensional discovery parameters correctly', async () => {
    const mockResponse = {
      data: [],
      meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
    };
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockResponse,
    } as any);

    const filters = {
      contentType: 'SERIES' as const,
      categoryId: 'cat-1',
      tagId: 'tag-1',
      sortBy: 'publishedAt' as const,
      order: 'DESC' as const,
      page: 2,
      limit: 10,
    };

    const res = await searchService.queryPosts(filters);
    expect(getSpy).toHaveBeenCalledWith('/posts', {
      params: {
        status: 'PUBLISHED',
        contentType: 'SERIES',
        categoryId: 'cat-1',
        tagId: 'tag-1',
        sortBy: 'publishedAt',
        order: 'DESC',
        page: 2,
        limit: 10,
      },
    });
    expect(res).toEqual(mockResponse);
  });

  it('searchCommandPalette() aggregates tag and category results', async () => {
    const mockTags = [{ id: 't-1', name: 'derivatives', slug: 'derivatives' }];
    const mockCategories = [{ id: 'c-1', name: 'Equities', slug: 'equities', scope: 'COMMUNITY', description: 'Equity markets' }];

    vi.spyOn(searchService, 'searchTags').mockResolvedValueOnce(mockTags as any);
    vi.spyOn(searchService, 'getCategories').mockResolvedValueOnce(mockCategories as any);

    const results = await searchService.searchCommandPalette('der');

    expect(results.some((r) => r.type === 'tag' && r.title === '#derivatives')).toBe(true);
  });
});
