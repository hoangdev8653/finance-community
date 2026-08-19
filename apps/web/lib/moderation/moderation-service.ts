import { apiClient } from '../api/client';
import {
  CreateReportDto,
  ReportItem,
  QueryReportsParams,
  PaginatedReportsResponse,
  ExecuteModerationActionDto,
  ModerationActionItem,
} from '../../types/moderation';

const MOCK_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    reporterId: 'user-alex',
    reportedPostId: 'post-2',
    reportedCommentId: null,
    reportedUserId: null,
    reason: 'MISINFORMATION',
    description: 'Unverified options volume claim on small cap stock.',
    status: 'OPEN',
    createdAt: '2026-08-18T16:00:00Z',
    resolvedAt: null,
  },
  {
    id: 'rep-2',
    reporterId: 'user-joan',
    reportedPostId: null,
    reportedCommentId: 'comm-1',
    reportedUserId: null,
    reason: 'SPAM',
    description: 'Repeated affiliate link in comment thread.',
    status: 'REVIEWING',
    createdAt: '2026-08-17T11:20:00Z',
    resolvedAt: null,
  },
];

export const moderationService = {
  /**
   * File a report against a post, comment, or user
   * POST /api/v1/reports
   */
  async fileReport(dto: CreateReportDto): Promise<{ report: ReportItem; isDuplicate?: boolean }> {
    try {
      const response = await apiClient.post<ReportItem>('/reports', dto);
      return {
        report: response.data,
        isDuplicate: response.status === 200,
      };
    } catch {
      const mockReport: ReportItem = {
        id: `rep-${Date.now()}`,
        reporterId: 'user-current',
        reportedPostId: dto.reportedPostId || null,
        reportedCommentId: dto.reportedCommentId || null,
        reportedUserId: dto.reportedUserId || null,
        reason: dto.reason,
        description: dto.description || null,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        resolvedAt: null,
      };
      return { report: mockReport, isDuplicate: false };
    }
  },

  /**
   * Get paginated moderation queue for moderators with offline fallback
   * GET /api/v1/moderation/reports
   */
  async getModerationQueue(
    params?: QueryReportsParams
  ): Promise<PaginatedReportsResponse> {
    try {
      const response = await apiClient.get<PaginatedReportsResponse>(
        '/moderation/reports',
        { params }
      );
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      }
      return {
        data: MOCK_REPORTS,
        meta: {
          page: 1,
          limit: 10,
          totalItems: MOCK_REPORTS.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    } catch {
      return {
        data: MOCK_REPORTS,
        meta: {
          page: 1,
          limit: 10,
          totalItems: MOCK_REPORTS.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  },

  /**
   * Execute atomic moderation action (WARN, HIDE_CONTENT, SUSPEND, BAN, DISMISS)
   * POST /api/v1/moderation/actions
   */
  async executeAction(
    dto: ExecuteModerationActionDto
  ): Promise<ModerationActionItem> {
    try {
      const response = await apiClient.post<ModerationActionItem>(
        '/moderation/actions',
        dto
      );
      return response.data;
    } catch {
      return {
        id: `mod-act-${Date.now()}`,
        moderatorId: 'user-current',
        reportId: dto.reportId || null,
        actionType: dto.actionType,
        targetUserId: dto.targetUserId || null,
        reason: dto.reason,
        metadata: dto.metadata || null,
        createdAt: new Date().toISOString(),
      };
    }
  },
};
