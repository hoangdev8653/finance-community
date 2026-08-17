import { apiClient } from '../api/client';
import {
  CreateReportDto,
  ReportItem,
  QueryReportsParams,
  PaginatedReportsResponse,
  ExecuteModerationActionDto,
  ModerationActionItem,
} from '../../types/moderation';

export const moderationService = {
  /**
   * File a report against a post, comment, or user
   * POST /api/v1/reports (Enforces exactly 1 target; deduplicates active reports)
   */
  async fileReport(dto: CreateReportDto): Promise<{ report: ReportItem; isDuplicate?: boolean }> {
    const response = await apiClient.post<ReportItem>('/reports', dto);
    // Backend returns status 200 for duplicate active report, 201 for new report
    return {
      report: response.data,
      isDuplicate: response.status === 200,
    };
  },

  /**
   * Get paginated moderation queue for moderators
   * GET /api/v1/moderation/reports
   */
  async getModerationQueue(
    params?: QueryReportsParams
  ): Promise<PaginatedReportsResponse> {
    const response = await apiClient.get<PaginatedReportsResponse>(
      '/moderation/reports',
      { params }
    );
    return response.data;
  },

  /**
   * Execute atomic moderation action (WARN, HIDE_CONTENT, SUSPEND, BAN, DISMISS)
   * POST /api/v1/moderation/actions
   */
  async executeAction(
    dto: ExecuteModerationActionDto
  ): Promise<ModerationActionItem> {
    const response = await apiClient.post<ModerationActionItem>(
      '/moderation/actions',
      dto
    );
    return response.data;
  },
};
