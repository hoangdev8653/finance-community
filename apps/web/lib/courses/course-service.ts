import { apiClient } from '../api/client';
import {
  CourseItem,
  CourseDetailResponse,
  QueryCourseParams,
} from '../../types/course';
import { PaginatedResult } from '../../types/content';

export const courseService = {
  /**
   * Get list of published educational series directly from Backend API
   * GET /api/v1/khoa-hoc
   */
  async getAllCourses(params?: QueryCourseParams): Promise<PaginatedResult<CourseItem>> {
    const response = await apiClient.get<PaginatedResult<CourseItem>>('/series', {
      params,
    });
    return response.data;
  },

  /**
   * Get series curriculum overview and paginated post list by slug directly from Backend API
   * GET /api/v1/khoa-hoc/:slug
   */
  async getBySlug(
    slug: string,
    params?: QueryCourseParams
  ): Promise<CourseDetailResponse> {
    const response = await apiClient.get<CourseDetailResponse>(
      `/series/${encodeURIComponent(slug)}`,
      { params }
    );
    return response.data;
  },
};
