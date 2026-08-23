import { apiClient } from '../api/client';
import { NotificationEntity, QueryNotificationsParams } from '../../types/notifications';
import { PaginatedResult } from '../../types/content';

export const notificationsService = {
  /**
   * Get current user's paginated notification feed directly from Backend API
   * GET /api/v1/notifications
   */
  async getUserNotifications(
    params?: QueryNotificationsParams
  ): Promise<PaginatedResult<NotificationEntity>> {
    const response = await apiClient.get<PaginatedResult<NotificationEntity>>(
      '/notifications',
      { params }
    );
    return response.data;
  },

  /**
   * Mark single notification as read directly on Backend API
   * PATCH /api/v1/notifications/:id/read
   */
  async markAsRead(id: string): Promise<boolean> {
    const response = await apiClient.patch<boolean>(
      `/notifications/${encodeURIComponent(id)}/read`
    );
    return response.data;
  },

  /**
   * Mark all user notifications as read directly on Backend API
   * POST /api/v1/notifications/read-all
   */
  async markAllAsRead(): Promise<boolean> {
    const response = await apiClient.post<boolean>('/notifications/read-all');
    return response.data;
  },
};

