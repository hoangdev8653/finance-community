import { postsService } from '../posts/posts-service';
import { usersService } from '../users/users-service';
import { PostEntity, PaginatedResult } from '../../types/content';
import { DashboardMetrics, DashboardPostsParams } from '../../types/dashboard';

export const dashboardService = {
  /**
   * Aggregate metrics for the author's research portfolio using bounded existing endpoints.
   */
  async getAuthorMetrics(authorId: string): Promise<DashboardMetrics> {
    try {
      const [publishedResult, draftsResult, followersResult] = await Promise.all([
        postsService.getFeed({ authorId, status: 'PUBLISHED', limit: 100 }),
        postsService.getFeed({ authorId, status: 'DRAFT', limit: 1 }),
        usersService.getFollowers(authorId, { limit: 1 }),
      ]);

      const totalAnalyses = publishedResult.meta.totalItems;
      const draftsCount = draftsResult.meta.totalItems;
      const followersCount = followersResult.meta.totalItems;
      const totalViews = publishedResult.data.reduce(
        (sum, post) => sum + (post.viewCount || 0),
        0
      );

      return {
        totalAnalyses,
        draftsCount,
        totalViews,
        followersCount,
      };
    } catch {
      return {
        totalAnalyses: 0,
        draftsCount: 0,
        totalViews: 0,
        followersCount: 0,
      };
    }
  },

  /**
   * Fetch author's posts filtered by status and page.
   */
  async getAuthorPosts(
    authorId: string,
    params?: DashboardPostsParams
  ): Promise<PaginatedResult<PostEntity>> {
    return postsService.getFeed({
      authorId,
      status: params?.status || 'PUBLISHED',
      page: params?.page || 1,
      limit: params?.limit || 10,
      sortBy: params?.sortBy || 'createdAt',
      order: params?.order || 'DESC',
    });
  },
};
