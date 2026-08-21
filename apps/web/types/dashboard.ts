import { PostEntity, PaginatedResult } from './content';

/**
 * High-level author portfolio metrics displayed on the dashboard.
 */
export interface DashboardMetrics {
  totalAnalyses: number;
  draftsCount: number;
  totalViews: number;
  followersCount: number;
}

/**
 * Active content tab in the dashboard workspace.
 */
export type DashboardTabType = 'published' | 'drafts' | 'archived' | 'bookmarks';

/**
 * Filter and pagination parameters for dashboard post queries.
 */
export interface DashboardPostsParams {
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  page?: number;
  limit?: number;
  sortBy?: 'publishedAt' | 'createdAt';
  order?: 'ASC' | 'DESC';
}
