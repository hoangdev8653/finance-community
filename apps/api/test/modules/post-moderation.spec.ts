import { ModerationService } from '../../src/modules/moderation/services/moderation.service';
import { PostsService } from '../../src/modules/posts/services/posts.service';

describe('Post Moderation Queue & Restricted Access Control', () => {
  describe('ModerationService Post Review Actions', () => {
    let moderationService: ModerationService;
    let mockPostsRepo: any;
    let mockModerationRepo: any;
    let mockAuditLogService: any;
    let mockNotificationsService: any;

    beforeEach(() => {
      mockPostsRepo = {
        findById: jest.fn().mockResolvedValue({
          id: 'post-100',
          authorId: 'author-user-1',
          title: 'Bài viết kiểm tra chứng khoán',
          status: 'PUBLISHED',
          moderationStatus: 'UNREVIEWED',
        }),
        findModerationPostsPaginated: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'post-100',
              title: 'Bài viết kiểm tra chứng khoán',
              moderationStatus: 'UNREVIEWED',
              author: { username: 'investor_pro', displayName: 'Investor Pro' },
            },
          ],
          meta: { page: 1, limit: 20, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
        }),
        updateModerationStatusTx: jest.fn().mockImplementation(async (tx, id, data) => ({
          id,
          ...data,
        })),
      };

      mockModerationRepo = {
        createTx: jest.fn().mockResolvedValue({ id: 'mod-action-1' }),
      };

      mockAuditLogService = {
        log: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      };

      mockNotificationsService = {
        createNotification: jest.fn().mockResolvedValue({ id: 'notif-1' }),
      };

      const mockDb: any = {
        transaction: jest.fn().mockImplementation(async (cb) => cb({})),
      };

      moderationService = new ModerationService(
        mockDb,
        mockModerationRepo,
        {} as any,
        mockPostsRepo,
        {} as any,
        {} as any,
        mockAuditLogService,
        mockNotificationsService,
      );
    });

    it('should query unreviewed posts queue for admin', async () => {
      const queue = await moderationService.getPostsQueue('UNREVIEWED', 1, 20);
      expect(queue.data.length).toBe(1);
      expect(queue.data[0].moderationStatus).toBe('UNREVIEWED');
      expect(mockPostsRepo.findModerationPostsPaginated).toHaveBeenCalledWith('UNREVIEWED', 1, 20);
    });

    it('should approve a post and mark moderationStatus as APPROVED', async () => {
      const updated = await moderationService.approvePost('admin-user-id', 'post-100');
      expect(updated.moderationStatus).toBe('APPROVED');
      expect(mockPostsRepo.updateModerationStatusTx).toHaveBeenCalledWith(
        expect.anything(),
        'post-100',
        expect.objectContaining({
          moderationStatus: 'APPROVED',
          moderatedBy: 'admin-user-id',
        }),
      );
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'MODERATION_APPROVE_POST',
          entity_id: 'post-100',
        }),
        expect.anything(),
      );
    });

    it('should ban a post, set status to HIDDEN, and notify author', async () => {
      const updated = await moderationService.banPost(
        'admin-user-id',
        'post-100',
        'Vi phạm chia sẻ link nhóm không được phép',
      );
      expect(updated.status).toBe('HIDDEN');
      expect(updated.moderationStatus).toBe('BANNED');
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'author-user-1',
          type: 'POST_MODERATED',
        }),
      );
    });
  });

  describe('PostsService Access Control on Hidden/Banned Posts', () => {
    let postsService: PostsService;
    let mockPostsRepo: any;
    let mockPostTagsRepo: any;
    let mockPostMediaRepo: any;

    beforeEach(() => {
      mockPostsRepo = {
        findBySlug: jest.fn().mockImplementation(async (contentType, slug) => {
          if (slug === 'banned-post') {
            return {
              id: 'post-banned-1',
              authorId: 'author-123',
              contentType: 'COMMUNITY',
              slug: 'banned-post',
              title: 'Bài viết bị cấm',
              status: 'HIDDEN',
              moderationStatus: 'BANNED',
              moderationReason: 'Spam lừa đảo',
            };
          }
          return {
            id: 'post-normal-1',
            authorId: 'author-999',
            contentType: 'COMMUNITY',
            slug: 'normal-post',
            title: 'Bài viết bình thường',
            status: 'PUBLISHED',
            moderationStatus: 'APPROVED',
          };
        }),
        incrementViewCountTx: jest.fn().mockResolvedValue(undefined),
      };

      mockPostTagsRepo = { getTagsForPost: jest.fn().mockResolvedValue([]) };
      mockPostMediaRepo = { getMediaForPost: jest.fn().mockResolvedValue([]) };

      postsService = new PostsService(
        {} as any,
        mockPostsRepo,
        mockPostTagsRepo,
        mockPostMediaRepo,
        {} as any,
        {} as any,
        {} as any,
      );
    });

    it('should BLOCK anonymous stranger from viewing a banned/hidden post (throw 404)', async () => {
      await expect(
        postsService.getPostBySlug('COMMUNITY', 'banned-post', 'anon-ip', undefined, undefined),
      ).rejects.toThrow('Published post \'banned-post\' in scope \'COMMUNITY\' not found.');
    });

    it('should BLOCK other logged-in user from viewing a banned/hidden post (throw 404)', async () => {
      await expect(
        postsService.getPostBySlug('COMMUNITY', 'banned-post', 'user-2-ip', 'user-other-456', ['MEMBER']),
      ).rejects.toThrow('Published post \'banned-post\' in scope \'COMMUNITY\' not found.');
    });

    it('should ALLOW the post author to view their own banned/hidden post', async () => {
      const post = await postsService.getPostBySlug(
        'COMMUNITY',
        'banned-post',
        'author-ip',
        'author-123',
        ['MEMBER'],
      );
      expect(post).toBeDefined();
      expect(post.id).toBe('post-banned-1');
      expect(post.status).toBe('HIDDEN');
      expect((post as any).moderationReason).toBe('Spam lừa đảo');
    });

    it('should ALLOW admin / moderator to view banned/hidden post', async () => {
      const post = await postsService.getPostBySlug(
        'COMMUNITY',
        'banned-post',
        'admin-ip',
        'admin-user-789',
        ['ADMIN'],
      );
      expect(post).toBeDefined();
      expect(post.id).toBe('post-banned-1');
      expect(post.status).toBe('HIDDEN');
    });
  });
});
