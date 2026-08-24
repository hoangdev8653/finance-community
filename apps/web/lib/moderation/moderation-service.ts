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
   * File a report against a post, comment, or user directly on Backend API
   * POST /api/v1/reports
   */
  async fileReport(dto: CreateReportDto): Promise<{ report: ReportItem; isDuplicate?: boolean }> {
    const response = await apiClient.post<ReportItem>('/reports', dto);
    return {
      report: response.data,
      isDuplicate: response.status === 200,
    };
  },

  /**
   * Get paginated moderation queue for moderators directly from Backend API
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
   * Execute atomic moderation action (WARN, HIDE_CONTENT, SUSPEND, BAN, DISMISS) directly on Backend API
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

  /**
   * Get paginated post moderation queue directly from Backend API
   * GET /api/v1/moderation/posts
   */
  async getModerationPosts(params?: {
    moderationStatus?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get('/moderation/posts', {
      params: params
        ? { status: params.moderationStatus, page: params.page, limit: params.limit }
        : undefined,
    });
    return response.data;
  },

  /**
   * Approve a post (mark as reviewed/approved) directly on Backend API
   * PATCH /api/v1/moderation/posts/:id/approve
   */
  async approvePost(id: string) {
    const response = await apiClient.patch(`/moderation/posts/${id}/approve`);
    return response.data;
  },

  /**
   * Ban a post (mark as banned and hide from community) directly on Backend API
   * PATCH /api/v1/moderation/posts/:id/ban
   */
  async banPost(id: string, reason?: string) {
    const response = await apiClient.patch(`/moderation/posts/${id}/ban`, { reason });
    return response.data;
  },
};

