import { CommentsService } from '../../src/modules/comments/services/comments.service';
import { ReactionsService } from '../../src/modules/reactions/services/reactions.service';
import { FollowsService } from '../../src/modules/follows/services/follows.service';

describe('Automated Event Notifications Triggers', () => {
  describe('CommentsService Notification Triggers', () => {
    let commentsService: CommentsService;
    let mockCommentsRepo: any;
    let mockPostsService: any;
    let mockNotificationsService: any;
    let mockDb: any;

    beforeEach(() => {
      mockDb = {};
      mockCommentsRepo = {
        createTx: jest.fn().mockResolvedValue({
          id: 'comment-1',
          postId: 'post-1',
          authorId: 'user-commenter',
          parentId: null,
          body: 'Great insights!',
          status: 'VISIBLE',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
        findById: jest.fn(),
      };
      mockPostsService = {
        getPostById: jest.fn().mockResolvedValue({
          id: 'post-1',
          authorId: 'user-author',
          title: 'Macro Market Analysis',
          status: 'PUBLISHED',
          deletedAt: null,
        }),
      };
      mockNotificationsService = {
        createNotification: jest.fn().mockResolvedValue({ id: 'notif-1' }),
      };

      commentsService = new CommentsService(
        mockDb,
        mockCommentsRepo,
        mockPostsService,
        undefined,
        undefined,
        mockNotificationsService,
      );
    });

    it('should dispatch NEW_COMMENT notification to post author when another user comments', async () => {
      await commentsService.createComment('user-commenter', 'post-1', {
        body: 'Great insights!',
      });

      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-author',
          type: 'NEW_COMMENT',
          referencePostId: 'post-1',
          referenceUserId: 'user-commenter',
        }),
      );
    });

    it('should not dispatch notification if author comments on their own post', async () => {
      await commentsService.createComment('user-author', 'post-1', {
        body: 'Self follow-up note',
      });

      expect(mockNotificationsService.createNotification).not.toHaveBeenCalled();
    });
  });

  describe('ReactionsService Notification Triggers', () => {
    let reactionsService: ReactionsService;
    let mockPostReactionsRepo: any;
    let mockCommentReactionsRepo: any;
    let mockPostsService: any;
    let mockCommentsService: any;
    let mockNotificationsService: any;
    let mockDb: any;

    beforeEach(() => {
      mockDb = {
        transaction: jest.fn().mockImplementation((cb) => cb({})),
      };
      mockPostReactionsRepo = {
        toggleReactionTx: jest.fn().mockResolvedValue({ reacted: true, reactionType: 'LIKE' }),
      };
      mockCommentReactionsRepo = {
        toggleReactionTx: jest.fn().mockResolvedValue({ reacted: true, reactionType: 'LIKE' }),
      };
      mockPostsService = {
        getPostById: jest.fn().mockResolvedValue({
          id: 'post-1',
          authorId: 'user-author',
          title: 'Macro Market Analysis',
          status: 'PUBLISHED',
          deletedAt: null,
        }),
      };
      mockCommentsService = {
        getCommentById: jest.fn().mockResolvedValue({
          id: 'comment-1',
          postId: 'post-1',
          authorId: 'user-commenter',
          status: 'VISIBLE',
          deletedAt: null,
        }),
      };
      mockNotificationsService = {
        createNotification: jest.fn().mockResolvedValue({ id: 'notif-1' }),
      };

      reactionsService = new ReactionsService(
        mockDb,
        mockPostReactionsRepo,
        mockCommentReactionsRepo,
        mockPostsService,
        mockCommentsService,
        undefined,
        mockNotificationsService,
      );
    });

    it('should dispatch POST_REACTION notification to author when post is liked', async () => {
      const result = await reactionsService.togglePostReaction('user-liker', 'post-1', {
        reactionType: 'LIKE',
      });

      expect(result.reacted).toBe(true);
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-author',
          type: 'POST_REACTION',
          referencePostId: 'post-1',
          referenceUserId: 'user-liker',
        }),
      );
    });
  });

  describe('FollowsService Notification Triggers', () => {
    let followsService: FollowsService;
    let mockFollowsRepo: any;
    let mockProfilesRepo: any;
    let mockNotificationsService: any;
    let mockDb: any;

    beforeEach(() => {
      mockDb = {
        transaction: jest.fn().mockImplementation((cb) => cb({})),
      };
      mockFollowsRepo = {
        isFollowing: jest.fn().mockResolvedValue(false),
        followTx: jest.fn().mockResolvedValue(undefined),
      };
      mockProfilesRepo = {
        findByUserId: jest.fn().mockResolvedValue({ userId: 'user-target' }),
      };
      mockNotificationsService = {
        createNotification: jest.fn().mockResolvedValue({ id: 'notif-1' }),
      };

      followsService = new FollowsService(
        mockDb,
        mockFollowsRepo,
        mockProfilesRepo,
        mockNotificationsService,
      );
    });

    it('should dispatch NEW_FOLLOWER notification when a new follow is established', async () => {
      const result = await followsService.followUser('user-follower', 'user-target');

      expect(result.following).toBe(true);
      expect(result.isNew).toBe(true);
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-target',
          type: 'NEW_FOLLOWER',
          referenceUserId: 'user-follower',
        }),
      );
    });
  });
});
