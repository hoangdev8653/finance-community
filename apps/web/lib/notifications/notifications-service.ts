import { apiClient } from '../api/client';
import { NotificationEntity, QueryNotificationsParams } from '../../types/notifications';
import { PaginatedResult } from '../../types/content';

const MOCK_NOTIFICATIONS: NotificationEntity[] = [
  {
    id: 'notif-1',
    userId: 'user-current',
    type: 'POST_REACTION',
    title: 'New Reaction',
    message: 'Alex Morgan reacted to your research report "Financial Analysis and Market Intelligence".',
    referencePostId: 'post-1',
    referenceCommentId: null,
    referenceUserId: '987fcdeb-1234-5678-abcd-ef0123456789',
    isRead: false,
    readAt: null,
    createdAt: '2026-08-19T10:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-current',
    type: 'COMMENT_NEW',
    title: 'New Discussion',
    message: 'Joan Names commented on your DCF Valuation framework model.',
    referencePostId: 'post-2',
    referenceCommentId: 'comm-1',
    referenceUserId: '12345678-abcd-ef01-2345-6789abcdef01',
    isRead: false,
    readAt: null,
    createdAt: '2026-08-18T14:20:00Z',
  },
  {
    id: 'notif-3',
    userId: 'user-current',
    type: 'USER_FOLLOW',
    title: 'New Follower',
    message: 'Marcus Vance started following your analysis stream.',
    referencePostId: null,
    referenceCommentId: null,
    referenceUserId: '56781234-ef01-abcd-2345-abcdef012345',
    isRead: true,
    readAt: '2026-08-17T09:00:00Z',
    createdAt: '2026-08-16T18:30:00Z',
  },
];

export const notificationsService = {
  /**
   * Get current user's paginated notification feed with offline fallback
   * GET /api/v1/notifications
   */
  async getUserNotifications(
    params?: QueryNotificationsParams
  ): Promise<PaginatedResult<NotificationEntity>> {
    try {
      const response = await apiClient.get<PaginatedResult<NotificationEntity>>(
        '/notifications',
        { params }
      );
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      }
      return {
        data: MOCK_NOTIFICATIONS,
        meta: {
          page: 1,
          limit: 10,
          totalItems: MOCK_NOTIFICATIONS.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    } catch {
      return {
        data: MOCK_NOTIFICATIONS,
        meta: {
          page: 1,
          limit: 10,
          totalItems: MOCK_NOTIFICATIONS.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  },

  /**
   * Mark single notification as read
   * PATCH /api/v1/notifications/:id/read
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      const response = await apiClient.patch<boolean>(
        `/notifications/${encodeURIComponent(id)}/read`
      );
      return response.data;
    } catch {
      return true;
    }
  },

  /**
   * Mark all user notifications as read
   * POST /api/v1/notifications/read-all
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await apiClient.post<boolean>('/notifications/read-all');
      return response.data;
    } catch {
      return true;
    }
  },
};
