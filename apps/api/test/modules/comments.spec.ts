import { CommentsService } from '../../src/modules/comments/services/comments.service';
import { CommentsRepository } from '../../src/database/repositories/comments.repository';
import { PostsService } from '../../src/modules/posts/services/posts.service';

describe('CommentsService (Threaded Discussion Engine)', () => {
  let commentsService: CommentsService;
  let mockDb: any;
  let mockCommentsRepo: jest.Mocked<CommentsRepository>;
  let mockPostsService: jest.Mocked<PostsService>;

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn(async (cb) => cb(mockDb)),
    };

    mockCommentsRepo = {
      createTx: jest.fn().mockImplementation(async (tx, data) => ({
        id: 'comment-uuid-1',
        postId: data.postId,
        authorId: data.authorId,
        parentId: data.parentId || null,
        body: data.body,
        status: 'VISIBLE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      updateTx: jest.fn().mockImplementation(async (tx, id, data) => ({
        id,
        postId: 'post-uuid-1',
        authorId: 'author-uuid-1',
        parentId: null,
        body: data.body || 'Original Body',
        status: 'VISIBLE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      findById: jest.fn().mockImplementation(async (id) => {
        if (id === 'comment-uuid-1') {
          return {
            id: 'comment-uuid-1',
            postId: 'post-uuid-1',
            authorId: 'author-uuid-1',
            parentId: null,
            body: 'Safe comment content',
            status: 'VISIBLE',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };
        }
        if (id === 'comment-deleted-1') {
          return {
            id: 'comment-deleted-1',
            postId: 'post-uuid-1',
            authorId: 'author-uuid-1',
            parentId: null,
            body: 'Original text',
            status: 'VISIBLE',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: new Date(),
          };
        }
        if (id === 'comment-other-post') {
          return {
            id: 'comment-other-post',
            postId: 'post-other-uuid',
            authorId: 'author-uuid-2',
            parentId: null,
            body: 'Comment on other post',
            status: 'VISIBLE',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };
        }
        return undefined;
      }),
      findThreadByPostId: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'comment-uuid-1',
            postId: 'post-uuid-1',
            authorId: 'author-uuid-1',
            parentId: null,
            body: 'Top-level comment',
            status: 'VISIBLE',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            authorProfile: { username: 'john_doe', displayName: 'John Doe', avatarMediaId: null },
          },
          {
            id: 'comment-deleted-1',
            postId: 'post-uuid-1',
            authorId: 'author-uuid-1',
            parentId: null,
            body: 'Original text',
            status: 'VISIBLE',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: new Date(),
            authorProfile: { username: 'john_doe', displayName: 'John Doe', avatarMediaId: null },
          },
        ],
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      }),
      softDeleteTx: jest.fn().mockResolvedValue(true),
    } as any;

    mockPostsService = {
      getPostById: jest.fn().mockImplementation(async (id) => {
        if (id === 'post-uuid-1') {
          return {
            id: 'post-uuid-1',
            authorId: 'post-author-uuid',
            contentType: 'COMMUNITY',
            title: 'Published Post',
            slug: 'published-post',
            status: 'PUBLISHED',
            deletedAt: null,
          } as any;
        }
        return undefined;
      }),
    } as any;

    commentsService = new CommentsService(mockDb, mockCommentsRepo, mockPostsService);
  });

  it('should create top-level comment and sanitize rich text body', async () => {
    const comment = await commentsService.createComment('author-uuid-1', 'post-uuid-1', {
      body: '<h3>Header</h3><script>alert(1)</script><p>Comment text</p>',
    });

    expect(comment.body).not.toContain('<script>');
    expect(comment.body).toContain('<h3>Header</h3>');
    expect(comment.body).toContain('<p>Comment text</p>');
    expect(mockCommentsRepo.createTx).toHaveBeenCalledTimes(1);
  });

  it('should reject reply if parent comment belongs to a different post', async () => {
    await expect(
      commentsService.createComment('author-uuid-1', 'post-uuid-1', {
        body: 'Reply to other post comment',
        parentId: 'comment-other-post',
      }),
    ).rejects.toThrow('Parent comment belongs to a different post.');
  });

  it('should allow child reply under a soft-deleted parent comment to preserve conversation context', async () => {
    const reply = await commentsService.createComment('author-uuid-2', 'post-uuid-1', {
      body: 'Valid reply under soft-deleted parent',
      parentId: 'comment-deleted-1',
    });

    expect(reply.parentId).toBe('comment-deleted-1');
    expect(reply.body).toBe('Valid reply under soft-deleted parent');
  });

  it('should mask soft-deleted comment body as [Comment deleted] in thread retrieval', async () => {
    const res = await commentsService.getPostComments('post-uuid-1', 1, 20);

    expect(res.data.length).toBe(2);
    expect(res.data[0].body).toBe('Top-level comment');
    expect(res.data[0].isDeleted).toBe(false);

    expect(res.data[1].body).toBe('[Comment deleted]');
    expect(res.data[1].isDeleted).toBe(true);
    expect(res.data[1].authorProfile?.username).toBe('[deleted]');
  });

  it('should reject edit attempts on soft-deleted comments', async () => {
    await expect(
      commentsService.updateComment('author-uuid-1', 'comment-deleted-1', { body: 'New text' }),
    ).rejects.toThrow('Deleted comments cannot be edited.');
  });

  it('should enforce author-only permission for comment updates', async () => {
    await expect(
      commentsService.updateComment('other-user', 'comment-uuid-1', { body: 'Unauthorized edit' }),
    ).rejects.toThrow();
  });
});
