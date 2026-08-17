import { apiClient } from '../api/client';
import {
  SeriesItem,
  SeriesDetailResponse,
  QuerySeriesParams,
} from '../../types/series';
import { PaginatedResult } from '../../types/content';

export const seriesService = {
  /**
   * Get list of published educational series
   * GET /api/v1/series
   */
  async getAllSeries(params?: QuerySeriesParams): Promise<PaginatedResult<SeriesItem>> {
    const response = await apiClient.get<PaginatedResult<SeriesItem>>('/series', {
      params,
    });
    return response.data;
  },

  /**
   * Get series curriculum overview and paginated post list by slug
   * GET /api/v1/series/:slug
   */
  async getBySlug(
    slug: string,
    params?: QuerySeriesParams
  ): Promise<SeriesDetailResponse> {
    const response = await apiClient.get<SeriesDetailResponse>(
      `/series/${encodeURIComponent(slug)}`,
      { params }
    );
    return response.data;
  },
};
