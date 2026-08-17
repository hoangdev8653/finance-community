import { apiClient } from '../api/client';
import { TagEntity, CategoryEntity, PaginatedResult, PostEntity } from '../../types/content';
import { SearchFilterState, SearchResultItem } from '../../types/search';

export const searchService = {
  /**
   * Search taxonomy tags with optional text matching and limit
   * GET /api/v1/tags?search=&limit=
   */
  async searchTags(search?: string, limit = 20): Promise<TagEntity[]> {
    const response = await apiClient.get<TagEntity[]>('/tags', {
      params: {
        search: search || undefined,
        limit,
      },
    });
    return response.data;
  },

  /**
   * Get taxonomy categories
   * GET /api/v1/categories
   */
  async getCategories(scope?: 'SERIES' | 'COMMUNITY'): Promise<CategoryEntity[]> {
    const response = await apiClient.get<CategoryEntity[]>('/categories', {
      params: {
        scope: scope || undefined,
      },
    });
    return response.data;
  },

  /**
   * Query published posts with multi-dimensional discovery filters
   * GET /api/v1/posts
   */
  async queryPosts(filters: SearchFilterState = {}): Promise<PaginatedResult<PostEntity>> {
    const params: Record<string, any> = {
      status: 'PUBLISHED',
      page: filters.page || 1,
      limit: filters.limit || 10,
    };

    if (filters.contentType && filters.contentType !== 'ALL') {
      params.contentType = filters.contentType;
    }
    if (filters.categoryId) {
      params.categoryId = filters.categoryId;
    }
    if (filters.tagId) {
      params.tagId = filters.tagId;
    }
    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
    }
    if (filters.order) {
      params.order = filters.order;
    }

    const response = await apiClient.get<PaginatedResult<PostEntity>>('/posts', {
      params,
    });
    return response.data;
  },

  /**
   * Aggregate search results for Command Palette
   */
  async searchCommandPalette(query: string): Promise<SearchResultItem[]> {
    const trimmed = query.trim().toLowerCase();
    const results: SearchResultItem[] = [];

    // Search tags
    const tags = await this.searchTags(trimmed, 6);
    tags.forEach((tag) => {
      results.push({
        type: 'tag',
        id: tag.id,
        title: `#${tag.name}`,
        slug: tag.slug,
        description: `Explore topic #${tag.name}`,
        url: `/tags/${encodeURIComponent(tag.slug)}`,
      });
    });

    // Match categories
    const categories = await this.getCategories();
    categories
      .filter(
        (cat) =>
          !trimmed ||
          cat.name.toLowerCase().includes(trimmed) ||
          cat.slug.toLowerCase().includes(trimmed)
      )
      .slice(0, 4)
      .forEach((cat) => {
        results.push({
          type: 'category',
          id: cat.id,
          title: cat.name,
          slug: cat.slug,
          contentType: cat.scope as 'SERIES' | 'COMMUNITY',
          description: cat.description || `${cat.scope} category`,
          url: `/?category=${encodeURIComponent(cat.id)}`,
        });
      });

    return results;
  },
};
