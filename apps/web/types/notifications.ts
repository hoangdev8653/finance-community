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
  page?: number;
  limit?: number;
}
