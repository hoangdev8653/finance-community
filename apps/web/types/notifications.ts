export type NotificationCategory = 'all' | 'unread' | 'comments' | 'social' | 'system';

export interface NotificationEntity {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string | null;
  referencePostId: string | null;
  referenceCommentId: string | null;
  referenceUserId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface QueryNotificationsParams {
  isRead?: boolean;
  category?: NotificationCategory;
  type?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedNotificationsResponse {
  data: NotificationEntity[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
