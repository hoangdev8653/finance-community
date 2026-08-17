import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postsService } from '@/lib/posts/posts-service';
import { apiClient } from '@/lib/api/client';

describe('Posts Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getFeed() calls GET /posts with status=PUBLISHED and provided params', async () => {
    const mockFeedResponse = {
      data: [
        {
          id: 'post-1',
          authorId: 'user-1',
          contentType: 'COMMUNITY' as const,
          title: 'Federal Reserve Policy Outlook',
          slug: 'fed-policy-outlook',
          body: null,
          coverMediaId: null,
          categoryId: 'cat-1',
          status: 'PUBLISHED' as const,
          metaTitle: null,
          metaDescription: 'An analysis on interest rate cycles.',
          viewCount: 142,
          publishedAt: '2026-08-15T12:00:00Z',
          createdAt: '2026-08-15T10:00:00Z',
          updatedAt: '2026-08-15T12:00:00Z',
          deletedAt: null,
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockFeedResponse } as any);

    const result = await postsService.getFeed({
      categoryId: 'cat-1',
      sortBy: 'publishedAt',
      order: 'DESC',
      page: 1,
      limit: 10,
    });

    expect(getSpy).toHaveBeenCalledWith('/posts', {
      params: {
        status: 'PUBLISHED',
        categoryId: 'cat-1',
        sortBy: 'publishedAt',
        order: 'DESC',
        page: 1,
        limit: 10,
      },
    });
    expect(result).toEqual(mockFeedResponse);
  });

  it('getBySlug() calls GET /posts/:contentType/:slug with uppercase contentType', async () => {
    const mockDetailResponse = {
      id: 'post-1',
      authorId: 'user-1',
      contentType: 'COMMUNITY' as const,
      title: 'Macro Analysis',
      slug: 'macro-analysis',
      body: '<p>Content</p>',
      coverMediaId: null,
      categoryId: 'cat-1',
      status: 'PUBLISHED' as const,
      metaTitle: null,
      metaDescription: null,
      viewCount: 10,
      publishedAt: '2026-08-15T00:00:00Z',
      createdAt: '2026-08-15T00:00:00Z',
      updatedAt: '2026-08-15T00:00:00Z',
      deletedAt: null,
      tags: [{ id: 't-1', name: 'macro', slug: 'macro' }],
      media: [],
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockDetailResponse } as any);

    const result = await postsService.getBySlug('community', 'macro-analysis');

    expect(getSpy).toHaveBeenCalledWith('/posts/COMMUNITY/macro-analysis');
    expect(result).toEqual(mockDetailResponse);
  });

  it('getCategories() calls GET /categories with optional scope', async () => {
    const mockCategories = [
      {
        id: 'cat-1',
        name: 'Macroeconomics',
        slug: 'macro',
        description: 'Global macro analysis',
        scope: 'COMMUNITY' as const,
        icon: null,
        sortOrder: 1,
        createdAt: '2026-08-01T00:00:00Z',
      },
    ];

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockCategories } as any);

    const result = await postsService.getCategories('COMMUNITY');

    expect(getSpy).toHaveBeenCalledWith('/categories', {
      params: { scope: 'COMMUNITY' },
    });
    expect(result).toEqual(mockCategories);
  });

  it('getTags() calls GET /tags with search query and limit', async () => {
    const mockTags = [
      {
        id: 'tag-1',
        name: 'bonds',
        slug: 'bonds',
        usageCount: 25,
        createdAt: '2026-08-01T00:00:00Z',
      },
    ];

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockTags } as any);

    const result = await postsService.getTags('bond', 10);

    expect(getSpy).toHaveBeenCalledWith('/tags', {
      params: { search: 'bond', limit: 10 },
    });
    expect(result).toEqual(mockTags);
  });
});
