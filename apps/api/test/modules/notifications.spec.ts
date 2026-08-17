import { NotificationsService } from '../../src/modules/notifications/services/notifications.service';
import { NotificationsRepository } from '../../src/database/repositories/notifications.repository';

describe('NotificationsService (In-App Notification Engine)', () => {
  let notificationsService: NotificationsService;
  let mockDb: any;
  let mockNotificationsRepo: jest.Mocked<NotificationsRepository>;

  beforeEach(() => {
    mockDb = {};

    mockNotificationsRepo = {
      createTx: jest.fn().mockImplementation(async (tx, data) => ({
        id: 'notif-uuid-1',
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message || null,
        referencePostId: data.referencePostId || null,
        referenceCommentId: data.referenceCommentId || null,
        referenceUserId: data.referenceUserId || null,
        isRead: false,
        readAt: null,
        createdAt: new Date(),
      })),
      findUserNotifications: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'notif-uuid-1',
            userId: 'user-recipient-1',
            type: 'COMMENT',
            title: 'New Reply',
            message: 'User B replied to your comment.',
            referencePostId: 'post-1',
            referenceCommentId: 'comment-1',
            referenceUserId: 'user-b',
            isRead: false,
            readAt: null,
            createdAt: new Date(),
          },
        ],
        meta: { page: 1, limit: 20, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      }),
      markAsReadTx: jest.fn().mockResolvedValue(true),
      markAllAsReadTx: jest.fn().mockResolvedValue(true),
    } as any;

    notificationsService = new NotificationsService(mockDb, mockNotificationsRepo);
  });

  it('should create notification record', async () => {
    const notif = await notificationsService.createNotification({
      userId: 'user-recipient-1',
      type: 'COMMENT',
      title: 'New Reply',
      message: 'User B replied to your comment.',
    });

    expect(notif.userId).toBe('user-recipient-1');
    expect(notif.type).toBe('COMMENT');
    expect(mockNotificationsRepo.createTx).toHaveBeenCalledTimes(1);
  });

  it('should retrieve user notification feed with pagination', async () => {
    const feed = await notificationsService.getUserNotifications('user-recipient-1', false, 1, 20);

    expect(feed.data.length).toBe(1);
    expect(feed.data[0].id).toBe('notif-uuid-1');
    expect(feed.data[0].isRead).toBe(false);
  });

  it('should mark single notification as read', async () => {
    const res = await notificationsService.markAsRead('user-recipient-1', 'notif-uuid-1');

    expect(res).toBe(true);
    expect(mockNotificationsRepo.markAsReadTx).toHaveBeenCalledWith(undefined, 'notif-uuid-1', 'user-recipient-1');
  });

  it('should mark all notifications as read', async () => {
    const res = await notificationsService.markAllAsRead('user-recipient-1');

    expect(res).toBe(true);
    expect(mockNotificationsRepo.markAllAsReadTx).toHaveBeenCalledWith(undefined, 'user-recipient-1');
  });
});
