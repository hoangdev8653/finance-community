import { PostsService } from '../../src/modules/posts/services/posts.service';
import { PostsRepository } from '../../src/database/repositories/posts.repository';
import { PostTagsRepository } from '../../src/database/repositories/post-tags.repository';
import { PostMediaRepository } from '../../src/database/repositories/post-media.repository';
import { CategoriesService } from '../../src/modules/categories/services/categories.service';
import { MediaService } from '../../src/modules/media/services/media.service';
import { TagsService } from '../../src/modules/tags/services/tags.service';

describe('PostsService (Content Engine)', () => {
  let postsService: PostsService;
  let mockDb: any;
  let mockPostsRepo: jest.Mocked<PostsRepository>;
  let mockPostTagsRepo: jest.Mocked<PostTagsRepository>;
  let mockPostMediaRepo: jest.Mocked<PostMediaRepository>;
  let mockCategoriesService: jest.Mocked<CategoriesService>;
  let mockMediaService: jest.Mocked<MediaService>;
  let mockTagsService: jest.Mocked<TagsService>;

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn(async (cb) => {
        const txMock: any = { ...mockDb };
        txMock.transaction = jest.fn(async (nestedCb) => nestedCb(txMock));
        return cb(txMock);
      }),
    };

    mockPostsRepo = {
      createTx: jest.fn().mockImplementation(async (tx, data) => ({
        id: 'post-uuid-1',
        authorId: data.authorId,
        contentType: data.contentType,
        title: data.title,
        slug: data.slug,
        body: data.body || null,
        coverMediaId: data.coverMediaId || null,
        categoryId: data.categoryId || null,
        status: data.status,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        viewCount: 0,
        publishedAt: data.publishedAt || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      updateTx: jest.fn().mockImplementation(async (tx, id, data) => ({
        id,
        authorId: 'author-uuid-1',
        contentType: 'COMMUNITY',
        title: data.title || 'Original Title',
        slug: 'original-title',
        body: data.body || null,
        coverMediaId: data.coverMediaId || null,
        categoryId: data.categoryId || null,
        status: data.status || 'DRAFT',
        metaTitle: null,
        metaDescription: null,
        viewCount: 0,
        publishedAt: data.publishedAt !== undefined ? data.publishedAt : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      findById: jest.fn().mockResolvedValue({
        id: 'post-uuid-1',
        authorId: 'author-uuid-1',
        contentType: 'COMMUNITY',
        title: 'Original Title',
        slug: 'original-title',
        body: 'Original Body',
        coverMediaId: null,
        categoryId: null,
        status: 'DRAFT',
        metaTitle: null,
        metaDescription: null,
        viewCount: 0,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
      findBySlug: jest.fn().mockResolvedValue(undefined),
      findFeedPaginated: jest.fn().mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      }),
      softDeleteTx: jest.fn().mockResolvedValue(true),
      incrementViewCountTx: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockPostTagsRepo = {
      syncTagsTx: jest.fn().mockResolvedValue(undefined),
      findByPostId: jest.fn().mockResolvedValue([]),
      getTagsForPost: jest.fn().mockResolvedValue([]),
    } as any;

    mockPostMediaRepo = {
      syncMediaTx: jest.fn().mockResolvedValue(undefined),
      findByPostId: jest.fn().mockResolvedValue([]),
      getMediaForPost: jest.fn().mockResolvedValue([]),
    } as any;

    mockCategoriesService = {
      getCategoryById: jest.fn().mockResolvedValue({
        id: 'cat-uuid-1',
        name: 'Market News',
        slug: 'market-news',
        scope: 'COMMUNITY',
        description: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      getCategories: jest.fn(),
    } as any;

    mockMediaService = {
      getMediaById: jest.fn().mockResolvedValue({
        id: 'media-uuid-1',
        uploaderId: 'author-uuid-1',
        cloudinaryPublicId: 'pub1',
        secureUrl: 'https://res.cloudinary.com/demo/image.jpg',
        resourceType: 'image',
        format: 'jpg',
        width: 800,
        height: 600,
        fileSize: 1000,
        purpose: 'cover',
        createdAt: new Date(),
        deletedAt: null,
      }),
    } as any;

    mockTagsService = {
      createTag: jest.fn().mockImplementation(async (dto) => ({
        id: `tag-${dto.name.toLowerCase()}`,
        name: dto.name,
        slug: dto.name.toLowerCase(),
        createdAt: new Date(),
      })),
      slugify: jest.fn((name) => name.toLowerCase()),
    } as any;

    postsService = new PostsService(
      mockDb,
      mockPostsRepo,
      mockPostTagsRepo,
      mockPostMediaRepo,
      mockCategoriesService,
      mockMediaService,
      mockTagsService,
    );
  });

  it('34.1: should create DRAFT post with publishedAt set to null', async () => {
    const post = await postsService.createPost('author-uuid-1', {
      title: 'Draft Post Title',
      contentType: 'COMMUNITY',
      status: 'DRAFT',
    });

    expect(post.status).toBe('DRAFT');
    expect(post.publishedAt).toBeNull();
  });

  it('34.2: should create PUBLISHED post with publishedAt timestamp set to current date', async () => {
    const post = await postsService.createPost('author-uuid-1', {
      title: 'Published Post Title',
      contentType: 'COMMUNITY',
      status: 'PUBLISHED',
    });

    expect(post.status).toBe('PUBLISHED');
    expect(post.publishedAt).toBeInstanceOf(Date);
  });

  it('34.3: should enforce ownership permissions on update and delete operations', async () => {
    // Non-author without moderator permissions should be rejected
    await expect(
      postsService.updatePost('other-user', ['MEMBER'], 'post-uuid-1', { title: 'Hacked' }),
    ).rejects.toThrow();

    await expect(
      postsService.deletePost('other-user', ['MEMBER'], 'post-uuid-1'),
    ).rejects.toThrow();

    // Author should succeed
    const updated = await postsService.updatePost('author-uuid-1', ['MEMBER'], 'post-uuid-1', {
      title: 'Author Update',
    });
    expect(updated.title).toBe('Author Update');
  });

  it('34.4: should sanitize malicious HTML script tags from post body using SanitizerUtil', async () => {
    const maliciousBody = '<h1>Title</h1><script>alert("XSS")</script><p>Safe content</p>';

    const post = await postsService.createPost('author-uuid-1', {
      title: 'XSS Test',
      contentType: 'COMMUNITY',
      body: maliciousBody,
      status: 'DRAFT',
    });

    expect(post.body).not.toContain('<script>');
    expect(post.body).toContain('<h1>Title</h1>');
    expect(post.body).toContain('<p>Safe content</p>');
  });

  it('34.5: should generate unique slug and handle collision with SAVEPOINT fallback', async () => {
    // Simulate slug collision on initial createTx call
    mockPostsRepo.createTx
      .mockRejectedValueOnce({
        code: '23505',
        message: 'duplicate key value violates unique constraint "uq_posts_content_type_slug"',
      })
      .mockResolvedValueOnce({
        id: 'post-uuid-1',
        authorId: 'author-uuid-1',
        contentType: 'COMMUNITY',
        title: 'Collision Title',
        slug: 'collision-title-author-u',
        body: null,
        coverMediaId: null,
        categoryId: null,
        status: 'DRAFT',
        moderationStatus: 'UNREVIEWED',
        moderatedBy: null,
        moderatedAt: null,
        moderationReason: null,
        metaTitle: null,
        metaDescription: null,
        viewCount: 0,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

    const post = await postsService.createPost('author-uuid-1', {
      title: 'Collision Title',
      contentType: 'COMMUNITY',
      status: 'DRAFT',
    });

    expect(post.slug).toBe('collision-title-author-u');
    expect(mockPostsRepo.createTx).toHaveBeenCalledTimes(2);
  });

  it('34.6: should rollback entire transaction if post_tags or post_media synchronization fails', async () => {
    mockPostTagsRepo.syncTagsTx.mockRejectedValue(new Error('Tag sync database failure'));

    await expect(
      postsService.createPost('author-uuid-1', {
        title: 'Rollback Test',
        contentType: 'COMMUNITY',
        tags: ['Finance'],
        status: 'DRAFT',
      }),
    ).rejects.toThrow('Tag sync database failure');
  });

  it('34.7: should soft delete post setting deletedAt timestamp', async () => {
    const result = await postsService.deletePost('author-uuid-1', ['MEMBER'], 'post-uuid-1');
    expect(result).toBe(true);
    expect(mockPostsRepo.softDeleteTx).toHaveBeenCalledWith(undefined, 'post-uuid-1');
  });

  it('34.8: should correctly transition publishedAt timestamp across status transitions', async () => {
    // DRAFT -> PUBLISHED should set publishedAt
    const pub = await postsService.updatePost('author-uuid-1', ['MEMBER'], 'post-uuid-1', {
      status: 'PUBLISHED',
    });
    expect(mockPostsRepo.updateTx).toHaveBeenCalledWith(
      expect.anything(),
      'post-uuid-1',
      expect.objectContaining({ status: 'PUBLISHED', publishedAt: expect.any(Date) }),
    );

    // PUBLISHED -> DRAFT should reset publishedAt to null
    mockPostsRepo.findById.mockResolvedValueOnce({
      id: 'post-uuid-1',
      authorId: 'author-uuid-1',
      contentType: 'COMMUNITY',
      title: 'Original Title',
      slug: 'original-title',
      body: 'Body',
      coverMediaId: null,
      categoryId: null,
      status: 'PUBLISHED',
      moderationStatus: 'UNREVIEWED',
      moderatedBy: null,
      moderatedAt: null,
      moderationReason: null,
      metaTitle: null,
      metaDescription: null,
      viewCount: 0,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await postsService.updatePost('author-uuid-1', ['MEMBER'], 'post-uuid-1', {
      status: 'DRAFT',
    });

    expect(mockPostsRepo.updateTx).toHaveBeenLastCalledWith(
      expect.anything(),
      'post-uuid-1',
      expect.objectContaining({ status: 'DRAFT', publishedAt: null }),
    );
  });
});
