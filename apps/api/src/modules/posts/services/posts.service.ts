import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  Optional,
} from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../../database/database.constants';
import type { DrizzleDB } from '../../../database/database.module';
import { PostsRepository, PostEntity } from '../../../database/repositories/posts.repository';
import { PostTagsRepository } from '../../../database/repositories/post-tags.repository';
import { PostTopicsRepository } from '../../../database/repositories/post-topics.repository';
import { TopicsRepository, TopicEntity } from '../../../database/repositories/topics.repository';
import { PostMediaRepository } from '../../../database/repositories/post-media.repository';
import { PostBookmarksRepository } from '../../../database/repositories/post-bookmarks.repository';
import { CategoriesService } from '../../categories/services/categories.service';
import { MediaService } from '../../media/services/media.service';
import { TagsService } from '../../tags/services/tags.service';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { SanitizerUtil } from '../../../common/utils/sanitizer.util';
import { ContentSafetyUtil } from '../../../common/utils/content-safety.util';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { QueryPostsDto } from '../dto/query-posts.dto';

export interface PostDetailResponse extends PostEntity {
  tags: Array<{ id: string; name: string; slug: string }>;
  topics: Array<{ id: string; name: string; slug: string; domainId: string; categoryId: string | null }>;
  media: Array<{ id: string; secureUrl: string; purpose: string; sortOrder: number }>;
}

@Injectable()
export class PostsService {
  private readonly viewDebounceCache = new Map<string, number>();
  private readonly VIEW_DEBOUNCE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes cooldown per viewer/IP

  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB,
    private readonly postsRepo: PostsRepository,
    private readonly postTagsRepo: PostTagsRepository,
    private readonly postMediaRepo: PostMediaRepository,
    private readonly categoriesService: CategoriesService,
    private readonly mediaService: MediaService,
    private readonly tagsService: TagsService,
    @Optional() private readonly postBookmarksRepo?: PostBookmarksRepository,
    @Optional() private readonly auditLogService?: AuditLogService,
    @Optional() private readonly postTopicsRepo?: PostTopicsRepository,
    @Optional() private readonly topicsRepo?: TopicsRepository,
  ) {}

  public incrementViewCountDebounced(postId: string, viewerIdentifier = 'anonymous'): void {
    const key = `${postId}:${viewerIdentifier}`;
    const now = Date.now();
    const lastView = this.viewDebounceCache.get(key);

    if (!lastView || now - lastView > this.VIEW_DEBOUNCE_WINDOW_MS) {
      this.viewDebounceCache.set(key, now);
      this.postsRepo.incrementViewCountTx(undefined, postId).catch(() => {});

      if (this.viewDebounceCache.size > 10000) {
        for (const [k, timestamp] of this.viewDebounceCache.entries()) {
          if (now - timestamp > this.VIEW_DEBOUNCE_WINDOW_MS) {
            this.viewDebounceCache.delete(k);
          }
        }
      }
    }
  }

  public slugify(title: string): string {
    const slugified = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const fallback = slugified.length > 0 ? slugified : 'post';
    return fallback.slice(0, 300);
  }

  public generateDeterministicSlug(title: string, authorId: string): string {
    const baseSlug = this.slugify(title);
    const suffix = authorId.replace(/-/g, '').slice(0, 8).toLowerCase();
    const maxBaseLen = 350 - 1 - suffix.length; // 350 - 1 - 8 = 341
    const truncatedBase = baseSlug.slice(0, Math.max(1, maxBaseLen));
    return `${truncatedBase}-${suffix}`;
  }

  private assertMatchingDomain(
    postDomainId: string | null | undefined,
    relatedDomainId: string | null | undefined,
    code: string,
    message: string,
  ): void {
    if (postDomainId && relatedDomainId && postDomainId !== relatedDomainId) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message,
        code,
      });
    }
  }

  private async resolveAndValidateTopics(topicIds: string[] | undefined, postDomainId: string | null): Promise<{
    topicIds: string[];
    topics: TopicEntity[];
    effectiveDomainId: string | null;
  }> {
    const uniqueTopicIds = Array.from(new Set(topicIds || []));
    if (uniqueTopicIds.length === 0) {
      return { topicIds: [], topics: [], effectiveDomainId: postDomainId };
    }

    if (!this.topicsRepo) {
      throw new BadRequestException('Topics repository is not available.');
    }

    const topics = await this.topicsRepo.findByIds(uniqueTopicIds);
    if (topics.length !== uniqueTopicIds.length) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'One or more topics do not exist.',
        code: 'INVALID_TOPICS',
      });
    }

    const domainIds = Array.from(new Set(topics.map((topic) => topic.domainId)));
    if (domainIds.length > 1) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'All topics attached to a post must belong to the same domain.',
        code: 'CROSS_DOMAIN_TOPICS',
      });
    }

    const topicDomainId = domainIds[0];
    this.assertMatchingDomain(
      postDomainId,
      topicDomainId,
      'INVALID_TOPIC_DOMAIN',
      'Topic domain must match post domain.',
    );

    return {
      topicIds: uniqueTopicIds,
      topics,
      effectiveDomainId: postDomainId || topicDomainId,
    };
  }

  private async syncTopicsTx(tx: any, postId: string, topicIds: string[]): Promise<void> {
    if (!this.postTopicsRepo) return;
    await this.postTopicsRepo.syncTopicsTx(tx, postId, topicIds);
  }

  private async getTopicsForPost(postId: string): Promise<Array<{ id: string; name: string; slug: string; domainId: string; categoryId: string | null }>> {
    if (!this.postTopicsRepo) return [];
    return this.postTopicsRepo.getTopicsForPost(postId);
  }

  public async generateUniqueSlugPg(
    tx: any,
    contentType: string,
    title: string,
    authorId: string,
  ): Promise<string> {
    const baseSlug = this.slugify(title);
    const existing = await this.postsRepo.findBySlug(contentType, baseSlug);
    if (!existing) {
      return baseSlug;
    }
    return this.generateDeterministicSlug(title, authorId);
  }

  async createPost(authorId: string, dto: CreatePostDto, userRoles: string[] = ['MEMBER']): Promise<PostDetailResponse> {
    const isPrivileged = userRoles.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role));
    const allowedContentTypes = isPrivileged ? ['COMMUNITY', 'NEWS', 'SERIES'] : ['COMMUNITY'];
    if (!allowedContentTypes.includes(dto.contentType)) {
      throw new ForbiddenException({ statusCode: 403, error: 'Forbidden', message: 'Your role is not allowed to create this content type.', code: 'CONTENT_TYPE_NOT_ALLOWED' });
    }
    if (!dto.domainId || !dto.categoryId) {
      throw new BadRequestException({ statusCode: 400, error: 'Bad Request', message: 'Domain and category are required for every post.', code: 'DOMAIN_CATEGORY_REQUIRED' });
    }
    // 1. Validate Category if provided
    let categoryDomainId: string | null = null;
    if (dto.categoryId) {
      const category = await this.categoriesService.getCategoryById(dto.categoryId);
      categoryDomainId = category.domainId;
      if (!category.contentTypes.includes(dto.contentType) && category.scope !== dto.contentType) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: `Category scope '${category.scope}' does not match post content type '${dto.contentType}'.`,
          code: 'INVALID_CATEGORY_SCOPE',
        });
      }
    }

    this.assertMatchingDomain(
      dto.domainId || null,
      categoryDomainId,
      'INVALID_POST_CATEGORY_DOMAIN',
      'Post domain must match category domain.',
    );

    const resolvedTopics = await this.resolveAndValidateTopics(dto.topics, dto.domainId || categoryDomainId);
    const effectiveDomainId = resolvedTopics.effectiveDomainId;

    // 2. Validate Cover Media if provided
    if (dto.coverMediaId) {
      const coverMedia = await this.mediaService.getMediaById(dto.coverMediaId);
      if (coverMedia.uploaderId !== authorId) {
        throw new ForbiddenException({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not own the cover media asset.',
          code: 'FORBIDDEN_MEDIA_OWNERSHIP',
        });
      }
    }

    // 3. Validate Attached Media IDs if provided
    if (dto.mediaIds && dto.mediaIds.length > 0) {
      for (const mediaId of dto.mediaIds) {
        const media = await this.mediaService.getMediaById(mediaId);
        if (media.uploaderId !== authorId) {
          throw new ForbiddenException({
            statusCode: 403,
            error: 'Forbidden',
            message: `You do not own attached media asset '${mediaId}'.`,
            code: 'FORBIDDEN_MEDIA_OWNERSHIP',
          });
        }
      }
    }

    // 4. Resolve Tags via TagsService
    const resolvedTagIds: string[] = [];
    if (dto.tags && dto.tags.length > 0) {
      for (const tagName of dto.tags) {
        if (tagName && tagName.trim().length > 0) {
          const tag = await this.tagsService.createTag({ name: tagName.trim() });
          resolvedTagIds.push(tag.id);
        }
      }
    }

    // 5. Sanitize Rich Text Body
    const sanitizedBody = dto.body ? SanitizerUtil.sanitizeRichText(dto.body) : null;

    // 5.1 Content Safety Evaluation (Anti-Phishing & Spam Filter)
    const safetyCheck = ContentSafetyUtil.evaluate(`${dto.title} ${dto.body || ''}`);
    const effectiveStatus = safetyCheck.isSevereSpam ? 'HIDDEN' : dto.status;

    // 6. Calculate PublishedAt
    const publishedAt = effectiveStatus === 'PUBLISHED' ? new Date() : null;

    // 7. Execute Atomic Transaction for Post + PostTags + PostMedia
    return await this.db.transaction(async (tx) => {
      const targetSlug = await this.generateUniqueSlugPg(tx, dto.contentType, dto.title, authorId);

      let postRecord: PostEntity | undefined;

      try {
        const executeInsert = async (client: any) => {
          return await this.postsRepo.createTx(client, {
            authorId,
            contentType: dto.contentType,
            title: dto.title,
            slug: targetSlug,
            body: sanitizedBody,
            coverMediaId: dto.coverMediaId || null,
            categoryId: dto.categoryId || null,
            domainId: effectiveDomainId,
            status: effectiveStatus,
            metaTitle: dto.metaTitle || null,
            metaDescription: dto.metaDescription || null,
            sourceType: dto.sourceType || 'USER',
            sourceUrl: dto.sourceUrl || null,
            sourceName: dto.sourceName || null,
            publishedAt,
          });
        };

        if (typeof tx.transaction === 'function') {
          await tx.transaction(async (nestedTx: any) => {
            postRecord = await executeInsert(nestedTx);
          });
        } else {
          postRecord = await executeInsert(tx);
        }
      } catch (err: any) {
        const pgCode = err?.code || err?.originalError?.code;
        if (pgCode === '23505' || err?.message?.includes('uq_posts_content_type_slug')) {
          const fallbackSlug = this.generateDeterministicSlug(dto.title, authorId);
          postRecord = await this.postsRepo.createTx(tx, {
            authorId,
            contentType: dto.contentType,
            title: dto.title,
            slug: fallbackSlug,
            body: sanitizedBody,
            coverMediaId: dto.coverMediaId || null,
            categoryId: dto.categoryId || null,
            domainId: effectiveDomainId,
            status: dto.status,
            metaTitle: dto.metaTitle || null,
            metaDescription: dto.metaDescription || null,
            sourceType: dto.sourceType || 'USER',
            sourceUrl: dto.sourceUrl || null,
            sourceName: dto.sourceName || null,
            publishedAt,
          });
        } else {
          throw err;
        }
      }

      if (!postRecord) {
        throw new BadRequestException('Failed to create post record.');
      }

      // Sync Post Tags atomically
      await this.postTagsRepo.syncTagsTx(tx, postRecord.id, resolvedTagIds);

      await this.syncTopicsTx(tx, postRecord.id, resolvedTopics.topicIds);

      // Sync Post Media atomically
      const mediaItems = (dto.mediaIds || []).map((mId, idx) => ({
        mediaId: mId,
        sortOrder: idx,
      }));
      await this.postMediaRepo.syncMediaTx(tx, postRecord.id, mediaItems);

      const tags = await this.postTagsRepo.getTagsForPost(postRecord.id);
      const topics = await this.getTopicsForPost(postRecord.id);
      const media = await this.postMediaRepo.getMediaForPost(postRecord.id);

      return {
        ...postRecord,
        tags,
        topics,
        media,
      };
    });
  }

  async updatePost(userSub: string, userRoles: string[], id: string, dto: UpdatePostDto): Promise<PostDetailResponse> {
    const existing = await this.postsRepo.findById(id);
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Post with ID '${id}' not found.`,
        code: 'POST_NOT_FOUND',
      });
    }

    const isAuthor = existing.authorId === userSub;
    const isModeratorOrAdmin = userRoles.some((r) => r === 'MODERATOR' || r === 'ADMIN' || r === 'SUPER_ADMIN');

    if (!isAuthor && !isModeratorOrAdmin) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'You do not have permission to update this post.',
        code: 'FORBIDDEN_RESOURCE',
      });
    }

    // 1. Validate Category if updating
    let categoryDomainId: string | null = null;
    if (dto.categoryId !== undefined ? dto.categoryId : existing.categoryId) {
      const category = await this.categoriesService.getCategoryById((dto.categoryId || existing.categoryId)!);
      categoryDomainId = category.domainId;
      if (!category.contentTypes.includes(existing.contentType) && category.scope !== existing.contentType) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: `Category scope '${category.scope}' does not match post content type '${existing.contentType}'.`,
          code: 'INVALID_CATEGORY_SCOPE',
        });
      }
    }

    const requestedDomainId = dto.domainId !== undefined ? dto.domainId || null : existing.domainId || null;
    this.assertMatchingDomain(
      requestedDomainId,
      categoryDomainId,
      'INVALID_POST_CATEGORY_DOMAIN',
      'Post domain must match category domain.',
    );

    const resolvedTopics = dto.topics !== undefined
      ? await this.resolveAndValidateTopics(dto.topics, requestedDomainId || categoryDomainId)
      : undefined;

    // 2. Validate Cover Media if updating
    if (dto.coverMediaId) {
      const coverMedia = await this.mediaService.getMediaById(dto.coverMediaId);
      if (coverMedia.uploaderId !== userSub && !isModeratorOrAdmin) {
        throw new ForbiddenException({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not own the cover media asset.',
          code: 'FORBIDDEN_MEDIA_OWNERSHIP',
        });
      }
    }

    // 3. Validate Attached Media IDs if updating
    if (dto.mediaIds && dto.mediaIds.length > 0) {
      for (const mediaId of dto.mediaIds) {
        const media = await this.mediaService.getMediaById(mediaId);
        if (media.uploaderId !== userSub && !isModeratorOrAdmin) {
          throw new ForbiddenException({
            statusCode: 403,
            error: 'Forbidden',
            message: `You do not own attached media asset '${mediaId}'.`,
            code: 'FORBIDDEN_MEDIA_OWNERSHIP',
          });
        }
      }
    }

    // 4. Resolve Tags if updating
    let resolvedTagIds: string[] | undefined;
    if (dto.tags !== undefined) {
      resolvedTagIds = [];
      for (const tagName of dto.tags) {
        if (tagName && tagName.trim().length > 0) {
          const tag = await this.tagsService.createTag({ name: tagName.trim() });
          resolvedTagIds.push(tag.id);
        }
      }
    }

    // 5. Sanitize Body if updating
    const sanitizedBody = dto.body !== undefined ? (dto.body ? SanitizerUtil.sanitizeRichText(dto.body) : null) : undefined;

    // 6. Calculate PublishedAt Lifecycle
    let publishedAt: Date | null | undefined;
    if (dto.status !== undefined) {
      if (dto.status === 'PUBLISHED') {
        publishedAt = existing.publishedAt ? existing.publishedAt : new Date();
      } else if (dto.status === 'DRAFT') {
        publishedAt = null;
      }
    }

    // 7. Atomic Transaction Update
    return await this.db.transaction(async (tx) => {
      const updateData: Partial<PostEntity> = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (sanitizedBody !== undefined) updateData.body = sanitizedBody;
      if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId || null;
      if (dto.domainId !== undefined) updateData.domainId = dto.domainId || null;
      if (dto.domainId === undefined && dto.categoryId && categoryDomainId) updateData.domainId = categoryDomainId;
      if (resolvedTopics && dto.domainId === undefined && !updateData.domainId) {
        updateData.domainId = resolvedTopics.effectiveDomainId;
      }
      if (dto.coverMediaId !== undefined) updateData.coverMediaId = dto.coverMediaId || null;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.metaTitle !== undefined) updateData.metaTitle = dto.metaTitle || null;
      if (dto.metaDescription !== undefined) updateData.metaDescription = dto.metaDescription || null;
      if (dto.sourceType !== undefined) updateData.sourceType = dto.sourceType;
      if (dto.sourceUrl !== undefined) updateData.sourceUrl = dto.sourceUrl || null;
      if (dto.sourceName !== undefined) updateData.sourceName = dto.sourceName || null;
      if (publishedAt !== undefined) updateData.publishedAt = publishedAt;

      const updated = await this.postsRepo.updateTx(tx, id, updateData);

      if (resolvedTagIds !== undefined) {
        await this.postTagsRepo.syncTagsTx(tx, id, resolvedTagIds);
      }

      if (resolvedTopics !== undefined) {
        await this.syncTopicsTx(tx, id, resolvedTopics.topicIds);
      }

      if (dto.mediaIds !== undefined) {
        const mediaItems = dto.mediaIds.map((mId, idx) => ({ mediaId: mId, sortOrder: idx }));
        await this.postMediaRepo.syncMediaTx(tx, id, mediaItems);
      }

      const tags = await this.postTagsRepo.getTagsForPost(id);
      const topics = await this.getTopicsForPost(id);
      const media = await this.postMediaRepo.getMediaForPost(id);

      if (this.auditLogService && dto.status && dto.status !== existing.status) {
        await this.auditLogService.log({
          actor_id: userSub,
          action: dto.status === 'HIDDEN' ? 'POST_HIDE' : 'POST_UPDATE',
          entity_type: 'posts',
          entity_id: id,
          metadata: { previousStatus: existing.status, newStatus: dto.status },
        });
      }

      return {
        ...updated!,
        tags,
        topics,
        media,
      };
    });
  }

  async getPostBySlug(
    contentType: string,
    slug: string,
    viewerIdentifier?: string,
    viewerUserId?: string,
    viewerRoles?: string[],
  ): Promise<PostDetailResponse> {
    const post = await this.postsRepo.findBySlug(contentType, slug);
    if (!post) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Published post '${slug}' in scope '${contentType}' not found.`,
        code: 'POST_NOT_FOUND',
      });
    }

    if (post.status !== 'PUBLISHED') {
      const isAuthor = viewerUserId && post.authorId === viewerUserId;
      const isModeratorOrAdmin =
        viewerRoles && viewerRoles.some((r) => r === 'MODERATOR' || r === 'ADMIN' || r === 'SUPER_ADMIN');

      if (!isAuthor && !isModeratorOrAdmin) {
        throw new NotFoundException({
          statusCode: 404,
          error: 'Not Found',
          message: `Published post '${slug}' in scope '${contentType}' not found.`,
          code: 'POST_NOT_FOUND',
        });
      }
    }

    // Debounced view count increment for published posts
    if (post.status === 'PUBLISHED') {
      this.incrementViewCountDebounced(post.id, viewerIdentifier);
    }

    const tags = await this.postTagsRepo.getTagsForPost(post.id);
    const topics = await this.getTopicsForPost(post.id);
    const media = await this.postMediaRepo.getMediaForPost(post.id);

    return {
      ...post,
      tags,
      topics,
      media,
    };
  }

  async getPostByDomainSlug(
    domainSlug: string,
    slug: string,
    viewerIdentifier?: string,
    viewerUserId?: string,
    viewerRoles?: string[],
  ): Promise<PostDetailResponse> {
    const post = await this.postsRepo.findByDomainSlug(domainSlug, slug);
    if (!post || post.status !== 'PUBLISHED') {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Published post '${slug}' in domain '${domainSlug}' not found.`,
        code: 'POST_NOT_FOUND',
      });
    }

    this.incrementViewCountDebounced(post.id, viewerIdentifier);
    const tags = await this.postTagsRepo.getTagsForPost(post.id);
    const topics = await this.getTopicsForPost(post.id);
    const media = await this.postMediaRepo.getMediaForPost(post.id);
    return { ...post, tags, topics, media };
  }

  async getPostById(id: string, viewerUserId?: string, viewerRoles?: string[]): Promise<PostDetailResponse> {
    const post = await this.postsRepo.findById(id);
    if (!post) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Post with ID '${id}' not found.`,
        code: 'POST_NOT_FOUND',
      });
    }

    if (post.status !== 'PUBLISHED') {
      const isAuthor = viewerUserId && post.authorId === viewerUserId;
      const isModeratorOrAdmin =
        viewerRoles && viewerRoles.some((r) => r === 'MODERATOR' || r === 'ADMIN' || r === 'SUPER_ADMIN');

      if (!isAuthor && !isModeratorOrAdmin) {
        throw new NotFoundException({
          statusCode: 404,
          error: 'Not Found',
          message: `Post with ID '${id}' not found.`,
          code: 'POST_NOT_FOUND',
        });
      }
    }

    const tags = await this.postTagsRepo.getTagsForPost(post.id);
    const topics = await this.getTopicsForPost(post.id);
    const media = await this.postMediaRepo.getMediaForPost(post.id);

    return {
      ...post,
      tags,
      topics,
      media,
    };
  }

  async toggleBookmark(userId: string, postId: string): Promise<{ bookmarked: boolean }> {
    const post = await this.postsRepo.findById(postId);
    if (!post || post.status !== 'PUBLISHED' || post.deletedAt !== null) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Published post '${postId}' not found.`,
        code: 'POST_NOT_FOUND',
      });
    }

    if (!this.postBookmarksRepo) {
      throw new BadRequestException('Bookmarks repository is not available.');
    }

    return this.postBookmarksRepo.toggleBookmarkTx(undefined, userId, postId);
  }

  async getMyBookmarkedPosts(userId: string, page = 1, limit = 20) {
    if (!this.postBookmarksRepo) {
      return {
        data: [],
        meta: { page, limit, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      };
    }
    return this.postBookmarksRepo.findUserBookmarksPaginated(userId, page, limit);
  }

  async findFeedPaginated(query: QueryPostsDto): Promise<any> {
    const options = {
      contentType: query.contentType,
      sourceType: query.sourceType,
      categoryId: query.categoryId,
      domainId: query.domainId,
      tagId: query.tagId,
      topicId: query.topicId,
      authorId: query.authorId,
      status: query.status || 'PUBLISHED',
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      order: query.order,
    };

    return this.postsRepo.findFeedPaginated(options);
  }

  async findFollowingFeed(userId: string, page = 1, limit = 20) {
    return this.postsRepo.findFollowingFeedPaginated(userId, page, limit);
  }

  async findTrendingFeed(page = 1, limit = 20) {
    return this.postsRepo.findTrendingFeedPaginated(page, limit);
  }

  async requestPostReview(userId: string, postId: string) {
    const post = await this.postsRepo.findById(postId);
    if (!post) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Post '${postId}' not found.`,
        code: 'POST_NOT_FOUND',
      });
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Only the author can request a review for this post.',
        code: 'FORBIDDEN_RESOURCE',
      });
    }

    return this.postsRepo.requestPostReviewTx(undefined, postId);
  }

  async deletePost(userSub: string, userRoles: string[], id: string): Promise<boolean> {
    const existing = await this.postsRepo.findById(id);
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Post with ID '${id}' not found.`,
        code: 'POST_NOT_FOUND',
      });
    }

    const isAuthor = existing.authorId === userSub;
    const isModeratorOrAdmin = userRoles.some((r) => r === 'MODERATOR' || r === 'ADMIN' || r === 'SUPER_ADMIN');

    if (!isAuthor && !isModeratorOrAdmin) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'You do not have permission to delete this post.',
        code: 'FORBIDDEN_RESOURCE',
      });
    }

    const deleted = await this.postsRepo.softDeleteTx(undefined, id);

    if (deleted && this.auditLogService) {
      await this.auditLogService.log({
        actor_id: userSub,
        action: 'POST_DELETE',
        entity_type: 'posts',
        entity_id: id,
      });
    }

    return deleted;
  }
}
