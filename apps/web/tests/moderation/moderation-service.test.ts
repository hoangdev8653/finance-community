import { describe, it, expect, vi, beforeEach } from 'vitest';
import { moderationService } from '@/lib/moderation/moderation-service';
import { apiClient } from '@/lib/api/client';

describe('Moderation Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fileReport() calls POST /reports with single target DTO', async () => {
    const dto = {
      reportedPostId: 'post-uuid-1',
      reason: 'Spam or commercial promotion',
      description: 'Repeated affiliate links.',
    };

    const mockReport = {
      id: 'report-uuid-1',
      reporterId: 'user-1',
      reportedPostId: 'post-uuid-1',
      reportedCommentId: null,
      reportedUserId: null,
      reason: dto.reason,
      description: dto.description,
      status: 'OPEN',
      createdAt: '2026-08-16T00:00:00Z',
      resolvedAt: null,
    };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      status: 201,
      data: mockReport,
    } as any);

    const result = await moderationService.fileReport(dto);

    expect(postSpy).toHaveBeenCalledWith('/reports', dto);
    expect(result.report).toEqual(mockReport);
    expect(result.isDuplicate).toBe(false);
  });

  it('fileReport() recognizes duplicate report when backend returns status 200', async () => {
    const dto = {
      reportedPostId: 'post-uuid-1',
      reason: 'Spam or commercial promotion',
    };

    const mockExistingReport = {
      id: 'report-uuid-existing',
      reporterId: 'user-1',
      reportedPostId: 'post-uuid-1',
      status: 'OPEN',
      reason: dto.reason,
      description: null,
      createdAt: '2026-08-16T00:00:00Z',
      resolvedAt: null,
    };

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      status: 200,
      data: mockExistingReport,
    } as any);

    const result = await moderationService.fileReport(dto);

    expect(result.isDuplicate).toBe(true);
    expect(result.report).toEqual(mockExistingReport);
  });

  it('getModerationQueue() calls GET /moderation/reports with query params', async () => {
    const mockQueueResponse = {
      data: [
        {
          id: 'report-1',
          reportedPostId: 'post-1',
          reason: 'Misinformation',
          status: 'OPEN',
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockQueueResponse,
    } as any);

    const params = { status: 'OPEN', page: 1, limit: 20 };
    const result = await moderationService.getModerationQueue(params);

    expect(getSpy).toHaveBeenCalledWith('/moderation/reports', { params });
    expect(result).toEqual(mockQueueResponse);
  });

  it('executeAction() calls POST /moderation/actions with execution DTO', async () => {
    const dto = {
      reportId: 'report-1',
      actionType: 'HIDE_CONTENT' as const,
      reason: 'Misinformation violating guidelines',
    };

    const mockActionItem = {
      id: 'action-uuid-1',
      moderatorId: 'mod-1',
      reportId: 'report-1',
      actionType: 'HIDE_CONTENT' as const,
      targetUserId: 'target-user-1',
      reason: dto.reason,
      metadata: null,
      createdAt: '2026-08-16T00:00:00Z',
    };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: mockActionItem,
    } as any);

    const result = await moderationService.executeAction(dto);

    expect(postSpy).toHaveBeenCalledWith('/moderation/actions', dto);
    expect(result).toEqual(mockActionItem);
  });
});
