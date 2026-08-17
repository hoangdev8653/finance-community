import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../../database/database.constants';
import type { DrizzleDB } from '../../../database/database.module';
import { ModerationActionsRepository } from '../../../database/repositories/moderation-actions.repository';
import { ReportsRepository } from '../../../database/repositories/reports.repository';
import { PostsRepository } from '../../../database/repositories/posts.repository';
import { CommentsRepository } from '../../../database/repositories/comments.repository';
import { UsersRepository } from '../../../database/repositories/users.repository';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { ExecuteModerationActionDto } from '../dto/execute-moderation-action.dto';

@Injectable()
export class ModerationService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB,
    private readonly moderationRepo: ModerationActionsRepository,
    private readonly reportsRepo: ReportsRepository,
    private readonly postsRepo: PostsRepository,
    private readonly commentsRepo: CommentsRepository,
    private readonly usersRepo: UsersRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async executeAction(moderatorId: string, moderatorRoles: string[], dto: ExecuteModerationActionDto) {
    let targetType: 'POST' | 'COMMENT' | 'USER';
    let targetId: string;
    let report: any;

    if (dto.reportId) {
      report = await this.reportsRepo.findById(dto.reportId);
      if (!report) {
        throw new NotFoundException({
          statusCode: 404,
          error: 'Not Found',
          message: `Report '${dto.reportId}' not found.`,
          code: 'REPORT_NOT_FOUND',
        });
      }
      if (report.reportedPostId) {
        targetType = 'POST';
        targetId = report.reportedPostId;
      } else if (report.reportedCommentId) {
        targetType = 'COMMENT';
        targetId = report.reportedCommentId;
      } else {
        targetType = 'USER';
        targetId = report.reportedUserId;
      }
    } else {
      const targets = [dto.targetPostId, dto.targetCommentId, dto.targetUserId].filter(Boolean);
      if (targets.length !== 1) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Exactly one target (targetPostId, targetCommentId, or targetUserId) must be specified when reportId is omitted.',
          code: 'INVALID_MODERATION_TARGET',
        });
      }
      if (dto.targetPostId) {
        targetType = 'POST';
        targetId = dto.targetPostId;
      } else if (dto.targetCommentId) {
        targetType = 'COMMENT';
        targetId = dto.targetCommentId;
      } else {
        targetType = 'USER';
        targetId = dto.targetUserId!;
      }
    }

    // Action Compatibility Check
    if (dto.actionType === 'HIDE_CONTENT' && targetType === 'USER') {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: "Action 'HIDE_CONTENT' cannot be applied to a USER target.",
        code: 'INVALID_TARGET_ACTION',
      });
    }

    // Single Atomic Transaction
    return await this.db.transaction(async (tx) => {
      let resolvedTargetUserId: string | null = targetType === 'USER' ? targetId : null;

      if (dto.actionType === 'HIDE_CONTENT') {
        if (targetType === 'POST') {
          const post = await this.postsRepo.findById(targetId);
          if (post) {
            resolvedTargetUserId = post.authorId;
            await this.postsRepo.updateTx(tx, targetId, { status: 'HIDDEN' });
          }
        } else if (targetType === 'COMMENT') {
          const comment = await this.commentsRepo.findById(targetId);
          if (comment) {
            resolvedTargetUserId = comment.authorId;
            await this.commentsRepo.updateTx(tx, targetId, { status: 'HIDDEN' });
          }
        }
      } else if (dto.actionType === 'SUSPEND' && targetType === 'USER') {
        await this.usersRepo.updateStatusTx(tx, targetId, 'SUSPENDED');
      } else if (dto.actionType === 'BAN' && targetType === 'USER') {
        await this.usersRepo.updateStatusTx(tx, targetId, 'BANNED');
      }

      // Record Moderation Action
      const actionRecord = await this.moderationRepo.createTx(tx, {
        moderatorId,
        reportId: dto.reportId || null,
        actionType: dto.actionType,
        targetUserId: resolvedTargetUserId,
        reason: dto.reason,
        metadata: dto.metadata || null,
      });

      // Resolve Report status if reportId exists
      if (dto.reportId) {
        const nextStatus = dto.actionType === 'DISMISS' ? 'DISMISSED' : 'RESOLVED';
        await this.reportsRepo.updateStatusTx(tx, dto.reportId, nextStatus);
      }

      // Synchronous Audit Log in the same transaction
      await this.auditLogService.log(
        {
          actor_id: moderatorId,
          action: `MODERATION_${dto.actionType}`,
          entity_type: targetType.toLowerCase() + 's',
          entity_id: targetId,
          reason: dto.reason,
          metadata: { reportId: dto.reportId || null, actionId: actionRecord.id },
        },
        tx,
      );

      return actionRecord;
    });
  }
}
