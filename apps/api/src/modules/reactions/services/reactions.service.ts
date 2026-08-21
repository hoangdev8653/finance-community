import { Injectable, NotFoundException, BadRequestException, Inject, Optional } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../../database/database.constants';
import type { DrizzleDB } from '../../../database/database.module';
import { PostReactionsRepository } from '../../../database/repositories/post-reactions.repository';
import { CommentReactionsRepository } from '../../../database/repositories/comment-reactions.repository';
import { ProfilesRepository } from '../../../database/repositories/profiles.repository';
import { PostsService } from '../../posts/services/posts.service';
import { CommentsService } from '../../comments/services/comments.service';
import { ToggleReactionDto } from '../dto/toggle-reaction.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class ReactionsService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB,
    private readonly postReactionsRepo: PostReactionsRepository,
    private readonly commentReactionsRepo: CommentReactionsRepository,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    @Optional() private readonly profilesRepo?: ProfilesRepository,
    @Optional() private readonly notificationsService?: NotificationsService,
  ) {}

  async togglePostReaction(userId: string, postId: string, dto: ToggleReactionDto) {
    const post = await this.postsService.getPostById(postId);
    if (!post || post.status !== 'PUBLISHED' || post.deletedAt !== null) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Published post '${postId}' not found.`,
        code: 'POST_NOT_FOUND',
      });
    }

    const type = dto.reactionType || 'LIKE';
    const result = await this.db.transaction(async (tx) => {
      return this.postReactionsRepo.toggleReactionTx(tx, userId, postId, type);
    });

    if (result.reacted && post.authorId !== userId) {
      // Award reputation points to post author (+5 points)
      if (this.profilesRepo) {
        try {
          await this.profilesRepo.incrementReputationScoreTx(undefined, post.authorId, 5);
        } catch {
          // Non-blocking
        }
      }

      // Dispatch in-app notification
      if (this.notificationsService) {
        try {
          await this.notificationsService.createNotification({
            userId: post.authorId,
            type: 'POST_REACTION',
            title: 'Lượt thích bài viết',
            message: `Có người đã bày tỏ cảm xúc với bài viết "${post.title.slice(0, 60)}"`,
            referencePostId: postId,
            referenceUserId: userId,
          });
        } catch {
          // Non-blocking notification dispatch
        }
      }
    }

    return result;
  }

  async toggleCommentReaction(userId: string, commentId: string, dto: ToggleReactionDto) {
    const comment = await this.commentsService.getCommentById(commentId);
    if (!comment || comment.status === 'HIDDEN') {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Comment '${commentId}' not found.`,
        code: 'COMMENT_NOT_FOUND',
      });
    }

    if (comment.deletedAt !== null) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Cannot react to a deleted comment.',
        code: 'CANNOT_REACT_TO_DELETED_COMMENT',
      });
    }

    const type = dto.reactionType || 'LIKE';
    const result = await this.db.transaction(async (tx) => {
      return this.commentReactionsRepo.toggleReactionTx(tx, userId, commentId, type);
    });

    if (result.reacted && this.notificationsService && comment.authorId !== userId) {
      try {
        await this.notificationsService.createNotification({
          userId: comment.authorId,
          type: 'COMMENT_REACTION',
          title: 'Lượt thích bình luận',
          message: `Có người đã bày tỏ cảm xúc với bình luận của bạn`,
          referencePostId: comment.postId,
          referenceCommentId: commentId,
          referenceUserId: userId,
        });
      } catch {
        // Non-blocking notification dispatch
      }
    }

    return result;
  }

  async getPostReactionCounts(postId: string, userId?: string) {
    return this.postReactionsRepo.getReactionCounts(postId, userId);
  }

  async getCommentReactionCounts(commentId: string, userId?: string) {
    return this.commentReactionsRepo.getReactionCounts(commentId, userId);
  }
}
