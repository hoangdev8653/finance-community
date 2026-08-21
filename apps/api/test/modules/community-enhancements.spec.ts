import { PostsService } from '../../src/modules/posts/services/posts.service';
import { ReportsService } from '../../src/modules/reports/services/reports.service';
import { CommentsService } from '../../src/modules/comments/services/comments.service';
import { SeriesService } from '../../src/modules/series/services/series.service';

describe('Community Enhancements (Appeal, Feeds, Auto-Hide, Comment Media, Series Nav)', () => {
  describe('1. Post Re-Review Appeal', () => {
    let postsService: PostsService;
    let mockPostsRepo: any;

    beforeEach(() => {
      mockPostsRepo = {
        findById: jest.fn().mockResolvedValue({
          id: 'post-banned-1',
          authorId: 'author-123',
          moderationStatus: 'BANNED',
          status: 'HIDDEN',
        }),
        requestPostReviewTx: jest.fn().mockResolvedValue({
          id: 'post-banned-1',
          moderationStatus: 'UNREVIEWED',
        }),
        findFollowingFeedPaginated: jest.fn().mockResolvedValue({ data: [], meta: {} }),
        findTrendingFeedPaginated: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      };

      postsService = new PostsService(
        {} as any,
        mockPostsRepo,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
      );
    });

    it('should allow author to request review after editing', async () => {
      const result = await postsService.requestPostReview('author-123', 'post-banned-1');
      expect(result.moderationStatus).toBe('UNREVIEWED');
      expect(mockPostsRepo.requestPostReviewTx).toHaveBeenCalledWith(undefined, 'post-banned-1');
    });

    it('should block non-author from requesting review (Forbidden 403)', async () => {
      await expect(
        postsService.requestPostReview('other-user-999', 'post-banned-1'),
      ).rejects.toThrow('Only the author can request a review for this post.');
    });

    it('should fetch following feed and trending feed', async () => {
      await postsService.findFollowingFeed('author-123', 1, 20);
      expect(mockPostsRepo.findFollowingFeedPaginated).toHaveBeenCalledWith('author-123', 1, 20);

      await postsService.findTrendingFeed(1, 20);
      expect(mockPostsRepo.findTrendingFeedPaginated).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('2. Auto-Hide on Mass Reports (>= 3 Reports)', () => {
    let reportsService: ReportsService;
    let mockReportsRepo: any;
    let mockPostsRepo: any;
    let mockPostsService: any;

    beforeEach(() => {
      mockReportsRepo = {
        findActiveReportForTarget: jest.fn().mockResolvedValue(undefined),
        createTx: jest.fn().mockResolvedValue({ id: 'report-3', status: 'OPEN' }),
        countActiveReportsForTarget: jest.fn().mockResolvedValue(3),
      };

      mockPostsRepo = {
        updateTx: jest.fn().mockResolvedValue({ id: 'post-spam-1', status: 'HIDDEN' }),
      };

      mockPostsService = {
        getPostById: jest.fn().mockResolvedValue({ id: 'post-spam-1', status: 'PUBLISHED' }),
      };

      reportsService = new ReportsService(
        {} as any,
        mockReportsRepo,
        mockPostsService,
        {} as any,
        {} as any,
        mockPostsRepo,
      );
    });

    it('should automatically hide post when active reports reach 3', async () => {
      await reportsService.fileReport('user-reporter-3', {
        reportedPostId: 'post-spam-1',
        reason: 'SPAM',
        description: 'Lừa đảo đầu tư',
      });

      expect(mockPostsRepo.updateTx).toHaveBeenCalledWith(
        undefined,
        'post-spam-1',
        expect.objectContaining({
          status: 'HIDDEN',
          moderationStatus: 'UNREVIEWED',
        }),
      );
    });
  });

  describe('3. Comment with Media Attachment', () => {
    let commentsService: CommentsService;
    let mockCommentsRepo: any;
    let mockPostsService: any;
    let mockMediaService: any;

    beforeEach(() => {
      mockPostsService = {
        getPostById: jest.fn().mockResolvedValue({ id: 'post-1', status: 'PUBLISHED', deletedAt: null }),
      };
      mockCommentsRepo = {
        createTx: jest.fn().mockImplementation(async (tx, data) => ({
          id: 'comment-1',
          ...data,
        })),
      };
      mockMediaService = {
        getMediaById: jest.fn().mockResolvedValue({
          id: 'chart-media-1',
          uploaderId: 'author-123',
          secureUrl: 'https://cloudinary.com/chart.png',
        }),
      };

      commentsService = new CommentsService(
        {} as any,
        mockCommentsRepo,
        mockPostsService,
        mockMediaService,
      );
    });

    it('should create comment with attached chart media successfully', async () => {
      const comment = await commentsService.createComment('author-123', 'post-1', {
        body: 'Biểu đồ kỹ thuật VN-Index hỗ trợ tại 1200 điểm',
        mediaId: 'chart-media-1',
      });

      expect(comment.mediaId).toBe('chart-media-1');
      expect(mockCommentsRepo.createTx).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          mediaId: 'chart-media-1',
        }),
      );
    });

    it('should forbid attaching media owned by another user', async () => {
      await expect(
        commentsService.createComment('stranger-user', 'post-1', {
          body: 'Bình luận giả mạo ảnh',
          mediaId: 'chart-media-1',
        }),
      ).rejects.toThrow('You do not own the attached media asset.');
    });
  });

  describe('4. Series Navigation', () => {
    let seriesService: SeriesService;
    let mockCategoriesService: any;
    let mockPostsRepo: any;

    beforeEach(() => {
      mockCategoriesService = {
        getCategoryById: jest.fn().mockResolvedValue({
          id: 'cat-series-1',
          name: 'Khóa học Chứng khoán F0',
          slug: 'khoa-hoc-f0',
        }),
      };

      mockPostsRepo = {
        findById: jest.fn().mockResolvedValue({
          id: 'post-part-2',
          contentType: 'SERIES',
          categoryId: 'cat-series-1',
        }),
        findFeedPaginated: jest.fn().mockResolvedValue({
          data: [
            { id: 'post-part-1', title: 'Phần 1: Khái niệm cơ bản', slug: 'phan-1' },
            { id: 'post-part-2', title: 'Phần 2: Đọc báo cáo tài chính', slug: 'phan-2' },
            { id: 'post-part-3', title: 'Phần 3: Phân tích kỹ thuật', slug: 'phan-3' },
          ],
        }),
      };

      seriesService = new SeriesService(mockCategoriesService, mockPostsRepo);
    });

    it('should calculate previousPost, nextPost, and full table of contents', async () => {
      const nav = await seriesService.getSeriesNavigation('post-part-2');

      expect(nav.series.name).toBe('Khóa học Chứng khoán F0');
      expect(nav.currentPostIndex).toBe(2);
      expect(nav.totalPosts).toBe(3);

      expect(nav.previousPost).toEqual({
        id: 'post-part-1',
        title: 'Phần 1: Khái niệm cơ bản',
        slug: 'phan-1',
      });

      expect(nav.nextPost).toEqual({
        id: 'post-part-3',
        title: 'Phần 3: Phân tích kỹ thuật',
        slug: 'phan-3',
      });

      expect(nav.tableOfContents.length).toBe(3);
      expect(nav.tableOfContents[1].isCurrent).toBe(true);
    });
  });
});
