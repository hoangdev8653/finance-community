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
import { CommentsRepository, CommentEntity } from '../../../database/repositories/comments.repository';
import { PostsService } from '../../posts/services/posts.service';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { SanitizerUtil } from '../../../common/utils/sanitizer.util';
import { ContentSafetyUtil } from '../../../common/utils/content-safety.util';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { MediaService } from '../../media/services/media.service';

import { NotificationsService } from '../../notifications/services/notifications.service';

export interface SerializedComment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  mediaId?: string | null;
  media?: { id: string; secureUrl: string } | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isDeleted: boolean;
  authorProfile?: {
    username: string;
    displayName: string | null;
    avatarMediaId: string | null;
  } | null;
}

@Injectable()
export class CommentsService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB,
    private readonly commentsRepo: CommentsRepository,
    private readonly postsService: PostsService,
    @Optional() private readonly mediaService?: MediaService,
    @Optional() private readonly auditLogService?: AuditLogService,
    @Optional() private readonly notificationsService?: NotificationsService,
  ) {}

  async createComment(authorId: string, postId: string, dto: CreateCommentDto): Promise<SerializedComment> {
    // 1. Validate Target Post
    const post = await this.postsService.getPostById(postId);
    if (!post || post.status !== 'PUBLISHED' || post.deletedAt !== null) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Published post '${postId}' not found.`,
        code: 'POST_NOT_FOUND',
      });
    }

    // 2. Validate Parent Comment if reply
    let parentComment: any;
    if (dto.parentId) {
      parentComment = await this.commentsRepo.findById(dto.parentId);
      if (!parentComment) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: `Parent comment with ID '${dto.parentId}' not found.`,
          code: 'INVALID_PARENT_COMMENT',
        });
      }
      if (parentComment.postId !== postId) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: `Parent comment belongs to a different post.`,
          code: 'PARENT_COMMENT_POST_MISMATCH',
        });
      }
    }

    // 2.1 Validate Attached Media if provided
    if (dto.mediaId && this.mediaService) {
      const media = await this.mediaService.getMediaById(dto.mediaId);
      if (media.uploaderId !== authorId) {
        throw new ForbiddenException({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not own the attached media asset.',
          code: 'FORBIDDEN_MEDIA_OWNERSHIP',
        });
      }
    }

    // 3. Sanitize Rich Text Body
    const sanitizedBody = SanitizerUtil.sanitizeRichText(dto.body);

    // 3.1 Content Safety Evaluation
    const safetyCheck = ContentSafetyUtil.evaluate(dto.body);
    const commentStatus = safetyCheck.isSevereSpam ? 'HIDDEN' : 'VISIBLE';

    // 4. Create Comment Record
    const record = await this.commentsRepo.createTx(undefined, {
      postId,
      authorId,
      parentId: dto.parentId || null,
      body: sanitizedBody,
      mediaId: dto.mediaId || null,
      status: commentStatus,
    });

    // 5. Dispatch in-app notifications asynchronously
    if (this.notificationsService) {
      try {
        // Notify post author if commenter is not post author
        if (post.authorId !== authorId) {
          await this.notificationsService.createNotification({
            userId: post.authorId,
            type: 'NEW_COMMENT',
            title: 'Bình luận mới',
            message: `Có bình luận mới trên bài viết "${post.title.slice(0, 60)}"`,
            referencePostId: postId,
            referenceCommentId: record.id,
            referenceUserId: authorId,
          });
        }

        // Notify parent comment author if reply and different user
        if (parentComment && parentComment.authorId !== authorId && parentComment.authorId !== post.authorId) {
          await this.notificationsService.createNotification({
            userId: parentComment.authorId,
            type: 'COMMENT_REPLY',
            title: 'Phản hồi bình luận',
            message: `Có người đã phản hồi bình luận của bạn`,
            referencePostId: postId,
            referenceCommentId: record.id,
            referenceUserId: authorId,
          });
        }
      } catch {
        // Non-blocking notification dispatch
      }
    }

    return this.serializeComment(record);
  }

  async updateComment(userSub: string, commentId: string, dto: UpdateCommentDto): Promise<SerializedComment> {
    const existing = await this.commentsRepo.findById(commentId);
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Comment with ID '${commentId}' not found.`,
        code: 'COMMENT_NOT_FOUND',
      });
    }

    if (existing.deletedAt !== null) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Deleted comments cannot be edited.',
        code: 'COMMENT_ALREADY_DELETED',
      });
    }

    if (existing.status === 'HIDDEN') {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Comment with ID '${commentId}' not found.`,
        code: 'COMMENT_NOT_FOUND',
      });
    }

    // Author Only
    if (existing.authorId !== userSub) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'You do not have permission to edit this comment.',
        code: 'FORBIDDEN_RESOURCE',
      });
    }

    const sanitizedBody = SanitizerUtil.sanitizeRichText(dto.body);
    const updated = await this.commentsRepo.updateTx(undefined, commentId, { body: sanitizedBody });

    return this.serializeComment(updated!);
  }

  async deleteComment(userSub: string, userRoles: string[], commentId: string): Promise<boolean> {
    const existing = await this.commentsRepo.findById(commentId);
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Comment with ID '${commentId}' not found.`,
        code: 'COMMENT_NOT_FOUND',
      });
    }

    if (existing.deletedAt !== null) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Comment is already deleted.',
        code: 'COMMENT_ALREADY_DELETED',
      });
    }

    const isAuthor = existing.authorId === userSub;
    const isModeratorOrAdmin = userRoles.some((r) => r === 'MODERATOR' || r === 'ADMIN' || r === 'SUPER_ADMIN');

    if (!isAuthor && !isModeratorOrAdmin) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'You do not have permission to delete this comment.',
        code: 'FORBIDDEN_RESOURCE',
      });
    }

    const deleted = await this.commentsRepo.softDeleteTx(undefined, commentId);

    if (deleted && this.auditLogService && !isAuthor) {
      await this.auditLogService.log({
        actor_id: userSub,
        action: 'COMMENT_DELETE',
        entity_type: 'comments',
        entity_id: commentId,
      });
    }

    return deleted;
  }

  async getCommentById(id: string): Promise<CommentEntity> {
    const comment = await this.commentsRepo.findById(id);
    if (!comment) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Comment with ID '${id}' not found.`,
        code: 'COMMENT_NOT_FOUND',
      });
    }
    return comment;
  }

  async getPostComments(postId: string, page = 1, limit = 20): Promise<{ data: SerializedComment[]; meta: any }> {
    // Validate target post
    const post = await this.postsService.getPostById(postId);
    if (!post || post.status !== 'PUBLISHED' || post.deletedAt !== null) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Published post '${postId}' not found.`,
        code: 'POST_NOT_FOUND',
      });
    }

    const thread = await this.commentsRepo.findThreadByPostId(postId, page, limit);

    const serializedData: SerializedComment[] = thread.data.map((c) => this.serializeComment(c));

    return {
      data: serializedData,
      meta: thread.meta,
    };
  }

  private serializeComment(c: any): SerializedComment {
    const isDeleted = Boolean(c.deletedAt);
    return {
      id: c.id,
      postId: c.postId,
      authorId: isDeleted ? '00000000-0000-0000-0000-000000000000' : c.authorId,
      parentId: c.parentId,
      body: isDeleted ? '[Comment deleted]' : c.body,
      mediaId: isDeleted ? null : c.mediaId || null,
      media: isDeleted ? null : c.media || null,
      status: c.status,
      createdAt: c.createdAt || new Date(),
      updatedAt: c.updatedAt || new Date(),
      deletedAt: c.deletedAt || null,
      isDeleted,
      authorProfile: isDeleted
        ? { username: '[deleted]', displayName: null, avatarMediaId: null }
        : c.authorProfile || null,
    };
  }
}
