import { ContentSafetyUtil } from '../../src/common/utils/content-safety.util';
import { PostsService } from '../../src/modules/posts/services/posts.service';

describe('Advanced Community Features (Bookmarks, Anti-Phishing, Reputation & View Debounce)', () => {
  describe('1. ContentSafetyUtil (Anti-Phishing & Spam Moderation Filter)', () => {
    it('should detect deceptive investment scam keywords (cam kết lợi nhuận, bao lỗ)', () => {
      const result = ContentSafetyUtil.evaluate('Tham gia ngay cam kết lợi nhuận x5 tài khoản trong 1 tuần!');
      expect(result.isSuspicious).toBe(true);
      expect(result.isSevereSpam).toBe(true);
      expect(result.suggestedStatus).toBe('HIDDEN');
    });

    it('should detect unauthorized external group invite links (zalo.me/g/..., t.me/...)', () => {
      const result = ContentSafetyUtil.evaluate('Vào nhóm phím lệnh VIP miễn phí tại https://zalo.me/g/abcxyz123');
      expect(result.isSuspicious).toBe(true);
      expect(result.isSevereSpam).toBe(true);
      expect(result.suggestedStatus).toBe('HIDDEN');
    });

    it('should detect phone spam solicitation', () => {
      const result = ContentSafetyUtil.evaluate('Ai cần kéo 1-1 liên hệ zalo: 0912345678');
      expect(result.isSuspicious).toBe(true);
      expect(result.isSevereSpam).toBe(true);
      expect(result.suggestedStatus).toBe('HIDDEN');
    });

    it('should pass legitimate financial analysis content as SAFE and PUBLISHED', () => {
      const result = ContentSafetyUtil.evaluate(
        'Phân tích báo cáo tài chính quý 2 của Vinamilk: Doanh thu thuần đạt mức tăng trưởng 5% so với cùng kỳ.',
      );
      expect(result.isSuspicious).toBe(false);
      expect(result.isSevereSpam).toBe(false);
      expect(result.suggestedStatus).toBe('PUBLISHED');
    });
  });

  describe('2. PostsService View Count Debounce', () => {
    let postsService: PostsService;
    let mockPostsRepo: any;
    let mockPostTagsRepo: any;
    let mockPostMediaRepo: any;
    let mockCategoriesService: any;
    let mockMediaService: any;
    let mockTagsService: any;
    let mockPostBookmarksRepo: any;

    beforeEach(() => {
      mockPostsRepo = {
        incrementViewCountTx: jest.fn().mockResolvedValue(undefined),
        findById: jest.fn(),
        findBySlug: jest.fn(),
      };
      mockPostTagsRepo = { getTagsForPost: jest.fn().mockResolvedValue([]) };
      mockPostMediaRepo = { getMediaForPost: jest.fn().mockResolvedValue([]) };
      mockCategoriesService = {};
      mockMediaService = {};
      mockTagsService = {};
      mockPostBookmarksRepo = {
        toggleBookmarkTx: jest.fn().mockResolvedValue({ bookmarked: true }),
        findUserBookmarksPaginated: jest.fn().mockResolvedValue({
          data: [],
          meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
        }),
      };

      postsService = new PostsService(
        {} as any,
        mockPostsRepo,
        mockPostTagsRepo,
        mockPostMediaRepo,
        mockCategoriesService as any,
        mockMediaService as any,
        mockTagsService as any,
        mockPostBookmarksRepo,
      );
    });

    it('should debounce rapid repeated views from the same IP/client', () => {
      const postId = 'post-100';
      const clientIp = '192.168.1.50';

      // 1st view
      postsService.incrementViewCountDebounced(postId, clientIp);
      expect(mockPostsRepo.incrementViewCountTx).toHaveBeenCalledTimes(1);

      // 2nd view immediately after (simulating spam refresh)
      postsService.incrementViewCountDebounced(postId, clientIp);
      // Count should STILL be 1 (debounced)
      expect(mockPostsRepo.incrementViewCountTx).toHaveBeenCalledTimes(1);

      // View from different IP
      postsService.incrementViewCountDebounced(postId, '10.0.0.1');
      // Count should increment to 2 for different viewer
      expect(mockPostsRepo.incrementViewCountTx).toHaveBeenCalledTimes(2);
    });

    it('should handle toggle bookmark through service', async () => {
      mockPostsRepo.findById.mockResolvedValue({
        id: 'post-100',
        status: 'PUBLISHED',
        deletedAt: null,
      });

      const result = await postsService.toggleBookmark('user-1', 'post-100');
      expect(result.bookmarked).toBe(true);
      expect(mockPostBookmarksRepo.toggleBookmarkTx).toHaveBeenCalledWith(undefined, 'user-1', 'post-100');
    });
  });
});
