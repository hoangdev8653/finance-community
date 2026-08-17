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
import { PostMediaRepository } from '../../../database/repositories/post-media.repository';
import { CategoriesService } from '../../categories/services/categories.service';
import { MediaService } from '../../media/services/media.service';
import { TagsService } from '../../tags/services/tags.service';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { SanitizerUtil } from '../../../common/utils/sanitizer.util';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { QueryPostsDto } from '../dto/query-posts.dto';

export interface PostDetailResponse extends PostEntity {
  tags: Array<{ id: string; name: string; slug: string }>;
  media: Array<{ id: string; secureUrl: string; purpose: string; sortOrder: number }>;
}

@Injectable()
export class PostsService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB,
    private readonly postsRepo: PostsRepository,
    private readonly postTagsRepo: PostTagsRepository,
    private readonly postMediaRepo: PostMediaRepository,
    private readonly categoriesService: CategoriesService,
    private readonly mediaService: MediaService,
    private readonly tagsService: TagsService,
    @Optional() private readonly auditLogService?: AuditLogService,
  ) {}

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

  async createPost(authorId: string, dto: CreatePostDto): Promise<PostDetailResponse> {
    // 1. Validate Category if provided
    if (dto.categoryId) {
      const category = await this.categoriesService.getCategoryById(dto.categoryId);
      if (category.scope !== dto.contentType) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: `Category scope '${category.scope}' does not match post content type '${dto.contentType}'.`,
          code: 'INVALID_CATEGORY_SCOPE',
        });
      }
    }

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

    // 6. Calculate PublishedAt
    const publishedAt = dto.status === 'PUBLISHED' ? new Date() : null;

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
            status: dto.status,
            metaTitle: dto.metaTitle || null,
            metaDescription: dto.metaDescription || null,
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
            status: dto.status,
            metaTitle: dto.metaTitle || null,
            metaDescription: dto.metaDescription || null,
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

      // Sync Post Media atomically
      const mediaItems = (dto.mediaIds || []).map((mId, idx) => ({
        mediaId: mId,
        sortOrder: idx,
      }));
      await this.postMediaRepo.syncMediaTx(tx, postRecord.id, mediaItems);

      const tags = await this.postTagsRepo.getTagsForPost(postRecord.id);
      const media = await this.postMediaRepo.getMediaForPost(postRecord.id);

      return {
        ...postRecord,
        tags,
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
    if (dto.categoryId) {
      const category = await this.categoriesService.getCategoryById(dto.categoryId);
      if (category.scope !== existing.contentType) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: `Category scope '${category.scope}' does not match post content type '${existing.contentType}'.`,
          code: 'INVALID_CATEGORY_SCOPE',
        });
      }
    }

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
      if (dto.coverMediaId !== undefined) updateData.coverMediaId = dto.coverMediaId || null;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.metaTitle !== undefined) updateData.metaTitle = dto.metaTitle || null;
      if (dto.metaDescription !== undefined) updateData.metaDescription = dto.metaDescription || null;
      if (publishedAt !== undefined) updateData.publishedAt = publishedAt;

      const updated = await this.postsRepo.updateTx(tx, id, updateData);

      if (resolvedTagIds !== undefined) {
        await this.postTagsRepo.syncTagsTx(tx, id, resolvedTagIds);
      }

      if (dto.mediaIds !== undefined) {
        const mediaItems = dto.mediaIds.map((mId, idx) => ({ mediaId: mId, sortOrder: idx }));
        await this.postMediaRepo.syncMediaTx(tx, id, mediaItems);
      }

      const tags = await this.postTagsRepo.getTagsForPost(id);
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
        media,
      };
    });
  }

  async getPostBySlug(contentType: string, slug: string): Promise<PostDetailResponse> {
    const post = await this.postsRepo.findBySlug(contentType, slug);
    if (!post || post.status !== 'PUBLISHED') {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Published post '${slug}' in scope '${contentType}' not found.`,
        code: 'POST_NOT_FOUND',
      });
    }

    // Asynchronously increment view count without blocking response
    this.postsRepo.incrementViewCountTx(undefined, post.id).catch(() => {});

    const tags = await this.postTagsRepo.getTagsForPost(post.id);
    const media = await this.postMediaRepo.getMediaForPost(post.id);

    return {
      ...post,
      tags,
      media,
    };
  }

  async getPostById(id: string): Promise<PostDetailResponse> {
    const post = await this.postsRepo.findById(id);
    if (!post) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Post with ID '${id}' not found.`,
        code: 'POST_NOT_FOUND',
      });
    }

    const tags = await this.postTagsRepo.getTagsForPost(post.id);
    const media = await this.postMediaRepo.getMediaForPost(post.id);

    return {
      ...post,
      tags,
      media,
    };
  }

  async findFeedPaginated(query: QueryPostsDto): Promise<any> {
    const options = {
      contentType: query.contentType,
      categoryId: query.categoryId,
      tagId: query.tagId,
      authorId: query.authorId,
      status: query.status || 'PUBLISHED',
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      order: query.order,
    };

    return this.postsRepo.findFeedPaginated(options);
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
