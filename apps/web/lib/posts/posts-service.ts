import { apiClient } from '../api/client';
import {
  PostEntity,
  PostDetailResponse,
  CategoryEntity,
  TagEntity,
  PaginatedResult,
  PostsFeedParams,
  CreatePostDto,
  UpdatePostDto,
} from '../../types/content';
import {
  MOCK_CATEGORIES,
  MOCK_TAGS,
  MOCK_POSTS,
  getMockPaginatedFeed,
} from './mock-posts-data';

export const postsService = {
  /**
   * Get public paginated post feed
   * GET /api/v1/posts with seamless offline fallback
   */
  async getFeed(params?: PostsFeedParams): Promise<PaginatedResult<PostEntity>> {
    try {
      const queryParams: Record<string, unknown> = {
        status: 'PUBLISHED',
        ...params,
      };
      const response = await apiClient.get<PaginatedResult<PostEntity>>('/posts', {
        params: queryParams,
      });
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      }
      return getMockPaginatedFeed(params);
    } catch {
      // Backend offline / network error fallback
      return getMockPaginatedFeed(params);
    }
  },

  /**
   * Get published post detail by content type and slug
   * GET /api/v1/posts/:contentType/:slug
   */
  async getBySlug(contentType: string, slug: string): Promise<PostDetailResponse> {
    try {
      const normalizedType = contentType.toUpperCase();
      const response = await apiClient.get<PostDetailResponse>(
        `/posts/${encodeURIComponent(normalizedType)}/${encodeURIComponent(slug)}`
      );
      return response.data;
    } catch {
      const found = MOCK_POSTS.find((p) => p.slug === slug) || MOCK_POSTS[0];
      return {
        ...found,
        tags: MOCK_TAGS.slice(0, 3).map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
        media: [],
      };
    }
  },

  /**
   * Create new post draft or publish immediately
   * POST /api/v1/posts
   */
  async createPost(dto: CreatePostDto): Promise<PostEntity> {
    const response = await apiClient.post<PostEntity>('/posts', dto);
    return response.data;
  },

  /**
   * Update existing post
   * PATCH /api/v1/posts/:id
   */
  async updatePost(id: string, dto: UpdatePostDto): Promise<PostEntity> {
    const response = await apiClient.patch<PostEntity>(
      `/posts/${encodeURIComponent(id)}`,
      dto
    );
    return response.data;
  },

  /**
   * Soft-delete post
   * DELETE /api/v1/posts/:id
   */
  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/posts/${encodeURIComponent(id)}`);
  },

  /**
   * Get content categories with seamless fallback
   * GET /api/v1/categories
   */
  async getCategories(scope?: 'SERIES' | 'COMMUNITY'): Promise<CategoryEntity[]> {
    try {
      const response = await apiClient.get<CategoryEntity[]>('/categories', {
        params: scope ? { scope } : undefined,
      });
      if (response.data && response.data.length > 0) {
        return response.data;
      }
      return MOCK_CATEGORIES;
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  /**
   * Search content tags with seamless fallback
   * GET /api/v1/tags
   */
  async getTags(search?: string, limit?: number): Promise<TagEntity[]> {
    try {
      const response = await apiClient.get<TagEntity[]>('/tags', {
        params: { search, limit },
      });
      if (response.data && response.data.length > 0) {
        return response.data;
      }
      return MOCK_TAGS;
    } catch {
      return MOCK_TAGS;
    }
  },

  /**
   * Get trending posts feed sorted by engagement and views
   * GET /api/v1/posts/feed/trending
   */
  async getTrendingFeed(params?: { page?: number; limit?: number }): Promise<PaginatedResult<PostEntity>> {
    try {
      const response = await apiClient.get<PaginatedResult<PostEntity>>('/posts/feed/trending', {
        params,
      });
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      }
      return getMockPaginatedFeed(params);
    } catch {
      return getMockPaginatedFeed(params);
    }
  },

  /**
   * Get posts feed from authors followed by current user
   * GET /api/v1/posts/feed/following
   */
  async getFollowingFeed(params?: { page?: number; limit?: number }): Promise<PaginatedResult<PostEntity>> {
    try {
      const response = await apiClient.get<PaginatedResult<PostEntity>>('/posts/feed/following', {
        params,
      });
      return response.data;
    } catch {
      return {
        data: [],
        meta: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  },

  /**
   * Get user's saved/bookmarked posts
   * GET /api/v1/posts/bookmarks/my-feed
   */
  async getMyBookmarks(page = 1, limit = 20): Promise<PaginatedResult<PostEntity>> {
    const response = await apiClient.get<PaginatedResult<PostEntity>>('/posts/bookmarks/my-feed', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Toggle post bookmark (save / unsave)
   * POST /api/v1/posts/:id/bookmark
   */
  async toggleBookmark(postId: string): Promise<{ bookmarked: boolean }> {
    const response = await apiClient.post<{ bookmarked: boolean }>(`/posts/${encodeURIComponent(postId)}/bookmark`);
    return response.data;
  },

  /**
   * Author requests moderation review after modifying banned/hidden post
   * POST /api/v1/posts/:id/request-review
   */
  async requestReview(postId: string): Promise<PostEntity> {
    const response = await apiClient.post<PostEntity>(`/posts/${encodeURIComponent(postId)}/request-review`);
    return response.data;
  },

  /**
   * Get series navigation details (previous, next, and table of contents)
   * GET /api/v1/series/posts/:id/navigation
   */
  async getSeriesNavigation(postId: string): Promise<{
    series: { id: string; name: string; slug: string };
    currentPostIndex: number;
    totalPosts: number;
    previousPost: { id: string; title: string; slug: string } | null;
    nextPost: { id: string; title: string; slug: string } | null;
    tableOfContents: Array<{ index: number; id: string; title: string; slug: string; isCurrent: boolean }>;
  }> {
    const response = await apiClient.get(`/series/posts/${encodeURIComponent(postId)}/navigation`);
    return response.data;
  },
};
