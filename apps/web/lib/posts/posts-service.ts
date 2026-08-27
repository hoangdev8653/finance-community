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
  DomainEntity,
} from '../../types/content';

export const postsService = {
  /**
   * Get public paginated post feed directly from Backend API
   * GET /api/v1/posts
   */
  async getFeed(params?: PostsFeedParams): Promise<PaginatedResult<PostEntity>> {
    const queryParams: Record<string, unknown> = {
      status: 'PUBLISHED',
      ...params,
    };
    const response = await apiClient.get<PaginatedResult<PostEntity>>('/posts', {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Get published post detail by content type and slug directly from Backend API
   * GET /api/v1/posts/:contentType/:slug
   */
  async getBySlug(contentType: string, slug: string): Promise<PostDetailResponse> {
    const normalizedType = contentType.toUpperCase();
    const response = await apiClient.get<PostDetailResponse>(
      `/posts/${encodeURIComponent(normalizedType)}/${encodeURIComponent(slug)}`
    );
    return response.data;
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
   * Get content categories directly from Backend API
   * GET /api/v1/categories
   */
  async getCategories(paramsOrScope?: {
    scope?: 'SERIES' | 'COMMUNITY' | 'NEWS';
    domainId?: string;
    contentType?: 'SERIES' | 'COMMUNITY' | 'NEWS';
    parentId?: string;
  } | 'SERIES' | 'COMMUNITY' | 'NEWS'): Promise<CategoryEntity[]> {
    const params = typeof paramsOrScope === 'string' ? { scope: paramsOrScope } : paramsOrScope;
    const response = await apiClient.get<CategoryEntity[]>('/categories', {
      params,
    });
    return response.data;
  },

  async getByDomainSlug(domainSlug: string, slug: string): Promise<PostDetailResponse> {
    const response = await apiClient.get<PostDetailResponse>(
      `/posts/domain/${encodeURIComponent(domainSlug)}/bai-viet/${encodeURIComponent(slug)}`
    );
    return response.data;
  },

  async getDomains(): Promise<DomainEntity[]> {
    const response = await apiClient.get<DomainEntity[]>('/domains');
    return response.data;
  },

  /**
   * Search content tags directly from Backend API
   * GET /api/v1/tags
   */
  async getTags(search?: string, limit?: number): Promise<TagEntity[]> {
    const response = await apiClient.get<TagEntity[]>('/tags', {
      params: { search, limit },
    });
    return response.data;
  },

  /**
   * Get trending posts feed sorted by engagement and views directly from Backend API
   * GET /api/v1/posts/feed/trending
   */
  async getTrendingFeed(params?: { page?: number; limit?: number }): Promise<PaginatedResult<PostEntity>> {
    const response = await apiClient.get<PaginatedResult<PostEntity>>('/posts/feed/trending', {
      params,
    });
    return response.data;
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
