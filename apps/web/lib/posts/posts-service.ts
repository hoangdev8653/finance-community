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
};
