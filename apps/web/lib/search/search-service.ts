import { apiClient } from '../api/client';
import { TagEntity, CategoryEntity, PaginatedResult, PostEntity } from '../../types/content';
import { SearchFilterState, SearchResultItem } from '../../types/search';
import { MOCK_CATEGORIES, MOCK_TAGS, getMockPaginatedFeed } from '../posts/mock-posts-data';

export const searchService = {
  /**
   * Search taxonomy tags with optional text matching and limit
   * GET /api/v1/tags?search=&limit=
   */
  async searchTags(search?: string, limit = 20): Promise<TagEntity[]> {
    try {
      const response = await apiClient.get<TagEntity[]>('/tags', {
        params: {
          search: search || undefined,
          limit,
        },
      });
      if (response.data && response.data.length > 0) {
        return response.data;
      }
      return MOCK_TAGS.filter((t) => !search || t.name.includes(search.toLowerCase())).slice(0, limit);
    } catch {
      return MOCK_TAGS.filter((t) => !search || t.name.includes(search.toLowerCase())).slice(0, limit);
    }
  },

  /**
   * Get taxonomy categories
   * GET /api/v1/categories
   */
  async getCategories(scope?: 'SERIES' | 'COMMUNITY'): Promise<CategoryEntity[]> {
    try {
      const response = await apiClient.get<CategoryEntity[]>('/categories', {
        params: {
          scope: scope || undefined,
        },
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
   * Query published posts with multi-dimensional discovery filters
   * GET /api/v1/posts
   */
  async queryPosts(filters: SearchFilterState = {}): Promise<PaginatedResult<PostEntity>> {
    try {
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
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      }
      return getMockPaginatedFeed({
        categoryId: filters.categoryId,
        tagId: filters.tagId,
        contentType: filters.contentType === 'ALL' ? undefined : filters.contentType,
        page: filters.page,
        limit: filters.limit,
      });
    } catch {
      return getMockPaginatedFeed({
        categoryId: filters.categoryId,
        tagId: filters.tagId,
        contentType: filters.contentType === 'ALL' ? undefined : filters.contentType,
        page: filters.page,
        limit: filters.limit,
      });
    }
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
