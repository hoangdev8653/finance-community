import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from '@/lib/dashboard/dashboard-service';
import { postsService } from '@/lib/posts/posts-service';
import { usersService } from '@/lib/users/users-service';

vi.mock('@/lib/posts/posts-service');
vi.mock('@/lib/users/users-service');

describe('Dashboard Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('aggregates metrics correctly from published posts, drafts, and followers', async () => {
    vi.mocked(postsService.getFeed).mockImplementation(async (params) => {
      if (params?.status === 'PUBLISHED') {
        return {
          data: [
            { id: 'p1', viewCount: 150 } as any,
            { id: 'p2', viewCount: 350 } as any,
          ],
          meta: { page: 1, limit: 100, totalItems: 2, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
        };
      }
      if (params?.status === 'DRAFT') {
        return {
          data: [],
          meta: { page: 1, limit: 1, totalItems: 4, totalPages: 4, hasNextPage: true, hasPreviousPage: false },
        };
      }
      return {
        data: [],
        meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      };
    });

    vi.mocked(usersService.getFollowers).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, limit: 1, totalItems: 42, totalPages: 42, hasNextPage: true, hasPreviousPage: false },
    });

    const metrics = await dashboardService.getAuthorMetrics('user-1');

    expect(metrics.totalAnalyses).toBe(2);
    expect(metrics.draftsCount).toBe(4);
    expect(metrics.totalViews).toBe(500);
    expect(metrics.followersCount).toBe(42);
  });

  it('returns fallback zero metrics if service calls fail', async () => {
    vi.mocked(postsService.getFeed).mockRejectedValueOnce(new Error('Network error'));
    vi.mocked(usersService.getFollowers).mockRejectedValueOnce(new Error('Network error'));

    const metrics = await dashboardService.getAuthorMetrics('user-error');

    expect(metrics).toEqual({
      totalAnalyses: 0,
      draftsCount: 0,
      totalViews: 0,
      followersCount: 0,
    });
  });

  it('queries author posts with expected status and pagination params', async () => {
    const mockFeedResult = {
      data: [
        { id: 'post-1', title: 'Tech DCF Model', status: 'PUBLISHED' } as any,
      ],
      meta: { page: 2, limit: 20, totalItems: 25, totalPages: 2, hasNextPage: false, hasPreviousPage: true },
    };

    vi.mocked(postsService.getFeed).mockResolvedValueOnce(mockFeedResult);

    const result = await dashboardService.getAuthorPosts('user-1', {
      status: 'PUBLISHED',
      page: 2,
      limit: 20,
    });

    expect(postsService.getFeed).toHaveBeenCalledWith({
      authorId: 'user-1',
      status: 'PUBLISHED',
      page: 2,
      limit: 20,
      sortBy: 'createdAt',
      order: 'DESC',
    });
    expect(result.data).toHaveLength(1);
    expect(result.meta.page).toBe(2);
  });

  it('uses default query parameters when none are supplied to getAuthorPosts', async () => {
    vi.mocked(postsService.getFeed).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
    });

    await dashboardService.getAuthorPosts('user-2');

    expect(postsService.getFeed).toHaveBeenCalledWith({
      authorId: 'user-2',
      status: 'PUBLISHED',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      order: 'DESC',
    });
  });
});
