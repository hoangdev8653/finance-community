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

export const postsService = {
  /**
   * Get public paginated post feed
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
   * Get published post detail by content type and slug
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
   * Get content categories
   * GET /api/v1/categories
   */
  async getCategories(scope?: 'SERIES' | 'COMMUNITY'): Promise<CategoryEntity[]> {
    const response = await apiClient.get<CategoryEntity[]>('/categories', {
      params: scope ? { scope } : undefined,
    });
    return response.data;
  },

  /**
   * Search content tags
   * GET /api/v1/tags
   */
  async getTags(search?: string, limit?: number): Promise<TagEntity[]> {
    const response = await apiClient.get<TagEntity[]>('/tags', {
      params: { search, limit },
    });
    return response.data;
  },
};
