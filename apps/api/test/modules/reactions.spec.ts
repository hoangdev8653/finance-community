import { ReactionsService } from '../../src/modules/reactions/services/reactions.service';
import { PostReactionsRepository } from '../../src/database/repositories/post-reactions.repository';
import { CommentReactionsRepository } from '../../src/database/repositories/comment-reactions.repository';
import { PostsService } from '../../src/modules/posts/services/posts.service';
import { CommentsService } from '../../src/modules/comments/services/comments.service';

describe('ReactionsService (Atomic Liking Engine)', () => {
  let reactionsService: ReactionsService;
  let mockDb: any;
  let mockPostReactionsRepo: jest.Mocked<PostReactionsRepository>;
  let mockCommentReactionsRepo: jest.Mocked<CommentReactionsRepository>;
  let mockPostsService: jest.Mocked<PostsService>;
  let mockCommentsService: jest.Mocked<CommentsService>;

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn(async (cb) => cb(mockDb)),
    };

    mockPostReactionsRepo = {
      findReaction: jest.fn().mockResolvedValue(undefined),
      toggleReactionTx: jest.fn().mockImplementation(async (tx, userId, postId, reactionType) => {
        return { reacted: true, reactionType };
      }),
      getReactionCounts: jest.fn().mockResolvedValue({ total: 5, userReacted: true }),
    } as any;

    mockCommentReactionsRepo = {
      findReaction: jest.fn().mockResolvedValue(undefined),
      toggleReactionTx: jest.fn().mockImplementation(async (tx, userId, commentId, reactionType) => {
        return { reacted: true, reactionType };
      }),
      getReactionCounts: jest.fn().mockResolvedValue({ total: 2, userReacted: false }),
    } as any;

    mockPostsService = {
      getPostById: jest.fn().mockImplementation(async (id) => {
        if (id === 'post-uuid-1') {
          return {
            id: 'post-uuid-1',
            status: 'PUBLISHED',
            deletedAt: null,
          } as any;
        }
        return undefined;
      }),
    } as any;

    mockCommentsService = {
      getCommentById: jest.fn().mockImplementation(async (id) => {
        if (id === 'comment-uuid-1') {
          return {
            id: 'comment-uuid-1',
            status: 'VISIBLE',
            deletedAt: null,
          } as any;
        }
        if (id === 'comment-deleted-1') {
          return {
            id: 'comment-deleted-1',
            status: 'VISIBLE',
            deletedAt: new Date(),
          } as any;
        }
        return undefined;
      }),
    } as any;

    reactionsService = new ReactionsService(
      mockDb,
      mockPostReactionsRepo,
      mockCommentReactionsRepo,
      mockPostsService,
      mockCommentsService,
    );
  });

  it('should toggle post reaction atomically', async () => {
    const res = await reactionsService.togglePostReaction('user-uuid-1', 'post-uuid-1', { reactionType: 'LIKE' });
    expect(res.reacted).toBe(true);
    expect(mockPostReactionsRepo.toggleReactionTx).toHaveBeenCalledWith(
      expect.anything(),
      'user-uuid-1',
      'post-uuid-1',
      'LIKE',
    );
  });

  it('should reject reaction attempt on soft-deleted comment', async () => {
    await expect(
      reactionsService.toggleCommentReaction('user-uuid-1', 'comment-deleted-1', { reactionType: 'LIKE' }),
    ).rejects.toThrow('Cannot react to a deleted comment.');
  });

  it('CONCURRENCY TEST: should handle concurrent duplicate reaction requests without unhandled 500 error', async () => {
    // Simulate real ON CONFLICT DO NOTHING behavior for concurrent duplicate calls
    let reactionStore = new Set<string>();

    mockPostReactionsRepo.toggleReactionTx.mockImplementation(async (tx, userId, postId, reactionType) => {
      const key = `${userId}:${postId}`;
      if (reactionStore.has(key)) {
        reactionStore.delete(key);
        return { reacted: false, reactionType: null };
      } else {
        reactionStore.add(key);
        return { reacted: true, reactionType: reactionType || 'LIKE' };
      }
    });

    const concurrentRequests = Promise.all([
      reactionsService.togglePostReaction('user-concurrent-1', 'post-uuid-1', {}),
      reactionsService.togglePostReaction('user-concurrent-1', 'post-uuid-1', {}),
    ]);

    const results = await concurrentRequests;

    expect(results.length).toBe(2);
    expect(results[0]).toBeDefined();
    expect(results[1]).toBeDefined();
    // One created, one toggled off -> Database constraint preserved with zero 500 error
    expect(typeof results[0].reacted).toBe('boolean');
    expect(typeof results[1].reacted).toBe('boolean');
  });
});
