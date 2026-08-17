import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationsService } from '@/lib/notifications/notifications-service';
import { apiClient } from '@/lib/api/client';

describe('Notifications Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getUserNotifications() calls GET /notifications with params', async () => {
    const mockResponse = {
      data: [
        {
          id: 'n-1',
          userId: 'u-1',
          type: 'NEW_FOLLOWER',
          title: 'New Follower',
          message: 'MacroAnalyst started following you.',
          referencePostId: null,
          referenceCommentId: null,
          referenceUserId: 'u-2',
          isRead: false,
          readAt: null,
          createdAt: '2026-08-15T00:00:00Z',
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

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await notificationsService.getUserNotifications({ isRead: false, page: 1, limit: 20 });

    expect(getSpy).toHaveBeenCalledWith('/notifications', { params: { isRead: false, page: 1, limit: 20 } });
    expect(result).toEqual(mockResponse);
  });

  it('markAsRead() calls PATCH /notifications/:id/read', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({ data: true } as any);

    const result = await notificationsService.markAsRead('n-123');

    expect(patchSpy).toHaveBeenCalledWith('/notifications/n-123/read');
    expect(result).toBe(true);
  });

  it('markAllAsRead() calls POST /notifications/read-all', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: true } as any);

    const result = await notificationsService.markAllAsRead();

    expect(postSpy).toHaveBeenCalledWith('/notifications/read-all');
    expect(result).toBe(true);
  });
});
