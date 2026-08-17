import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../../database/database.constants';
import type { DrizzleDB } from '../../../database/database.module';
import { PostReactionsRepository } from '../../../database/repositories/post-reactions.repository';
import { CommentReactionsRepository } from '../../../database/repositories/comment-reactions.repository';
import { PostsService } from '../../posts/services/posts.service';
import { CommentsService } from '../../comments/services/comments.service';
import { ToggleReactionDto } from '../dto/toggle-reaction.dto';

@Injectable()
export class ReactionsService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB,
    private readonly postReactionsRepo: PostReactionsRepository,
    private readonly commentReactionsRepo: CommentReactionsRepository,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
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
    return await this.db.transaction(async (tx) => {
      return this.postReactionsRepo.toggleReactionTx(tx, userId, postId, type);
    });
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
    return await this.db.transaction(async (tx) => {
      return this.commentReactionsRepo.toggleReactionTx(tx, userId, commentId, type);
    });
  }

  async getPostReactionCounts(postId: string, userId?: string) {
    return this.postReactionsRepo.getReactionCounts(postId, userId);
  }

  async getCommentReactionCounts(commentId: string, userId?: string) {
    return this.commentReactionsRepo.getReactionCounts(commentId, userId);
  }
}
