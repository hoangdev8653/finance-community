import { Injectable, BadRequestException, NotFoundException, Inject, Optional } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../../database/database.constants';
import type { DrizzleDB } from '../../../database/database.module';
import { ReportsRepository } from '../../../database/repositories/reports.repository';
import { PostsRepository } from '../../../database/repositories/posts.repository';
import { CommentsRepository } from '../../../database/repositories/comments.repository';
import { PostsService } from '../../posts/services/posts.service';
import { CommentsService } from '../../comments/services/comments.service';
import { ProfilesRepository } from '../../../database/repositories/profiles.repository';
import { CreateReportDto } from '../dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB,
    private readonly reportsRepo: ReportsRepository,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly profilesRepo: ProfilesRepository,
    @Optional() private readonly postsRepo?: PostsRepository,
    @Optional() private readonly commentsRepo?: CommentsRepository,
  ) {}

  async fileReport(reporterId: string, dto: CreateReportDto) {
    const targets = [dto.reportedPostId, dto.reportedCommentId, dto.reportedUserId].filter(Boolean);
    if (targets.length !== 1) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Exactly one target (reportedPostId, reportedCommentId, or reportedUserId) must be specified.',
        code: 'INVALID_REPORT_TARGET',
      });
    }

    let targetType: 'POST' | 'COMMENT' | 'USER';
    let targetId: string;

    if (dto.reportedPostId) {
      targetType = 'POST';
      targetId = dto.reportedPostId;
      const post = await this.postsService.getPostById(targetId);
      if (!post) {
        throw new NotFoundException({
          statusCode: 404,
          error: 'Not Found',
          message: `Target post '${targetId}' not found.`,
          code: 'POST_NOT_FOUND',
        });
      }
    } else if (dto.reportedCommentId) {
      targetType = 'COMMENT';
      targetId = dto.reportedCommentId;
      const comment = await this.commentsService.getCommentById(targetId);
      if (!comment) {
        throw new NotFoundException({
          statusCode: 404,
          error: 'Not Found',
          message: `Target comment '${targetId}' not found.`,
          code: 'COMMENT_NOT_FOUND',
        });
      }
    } else {
      targetType = 'USER';
      targetId = dto.reportedUserId!;
      const profile = await this.profilesRepo.findByUserId(targetId);
      if (!profile) {
        throw new NotFoundException({
          statusCode: 404,
          error: 'Not Found',
          message: `Target user '${targetId}' not found.`,
          code: 'USER_NOT_FOUND',
        });
      }
    }

    // Check duplicate active report
    const existing = await this.reportsRepo.findActiveReportForTarget(reporterId, targetType, targetId);
    if (existing) {
      return { report: existing, isDuplicate: true };
    }

    const report = await this.reportsRepo.createTx(undefined, {
      reporterId,
      reportedPostId: dto.reportedPostId || null,
      reportedCommentId: dto.reportedCommentId || null,
      reportedUserId: dto.reportedUserId || null,
      reason: dto.reason,
      description: dto.description || null,
      status: 'PENDING',
    });

    // Auto-hide content on mass reports (>= 3 active reports)
    if (targetType === 'POST' && this.postsRepo) {
      try {
        const activeCount = await this.reportsRepo.countActiveReportsForTarget('POST', targetId);
        if (activeCount >= 3) {
          await this.postsRepo.updateTx(undefined, targetId, {
            status: 'HIDDEN',
            moderationStatus: 'UNREVIEWED',
            moderationReason: `Hệ thống tự động tạm ẩn do nhận được ${activeCount} lượt báo cáo vi phạm từ cộng đồng.`,
          });
        }
      } catch {
        // Non-blocking
      }
    } else if (targetType === 'COMMENT' && this.commentsRepo) {
      try {
        const activeCount = await this.reportsRepo.countActiveReportsForTarget('COMMENT', targetId);
        if (activeCount >= 3) {
          await this.commentsRepo.updateTx(undefined, targetId, {
            status: 'HIDDEN',
          });
        }
      } catch {
        // Non-blocking
      }
    }

    return { report, isDuplicate: false };
  }

  async getQueue(status?: string, page = 1, limit = 20) {
    return this.reportsRepo.findQueuePaginated(status, page, limit);
  }
}
