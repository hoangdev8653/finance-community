import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../../database/database.constants';
import type { DrizzleDB } from '../../../database/database.module';
import { NotificationsRepository, NewNotificationEntity } from '../../../database/repositories/notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB,
    private readonly notificationsRepo: NotificationsRepository,
  ) {}

  async createNotification(data: NewNotificationEntity) {
    return this.notificationsRepo.createTx(undefined, data);
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationsRepo.getUnreadCount(userId);
    return { count };
  }

  async getUserNotifications(
    userId: string,
    isRead?: boolean,
    category?: string,
    type?: string,
    page = 1,
    limit = 20,
  ) {
    let types: string[] | undefined = undefined;
    let effectiveIsRead = isRead;

    if (category === 'unread') {
      effectiveIsRead = false;
    } else if (category === 'comments') {
      types = ['NEW_COMMENT', 'COMMENT_REPLY'];
    } else if (category === 'social') {
      types = ['POST_REACTION', 'NEW_FOLLOWER'];
    } else if (category === 'system') {
      types = ['POST_APPROVED', 'POST_BANNED', 'SYSTEM'];
    }

    if (type) {
      types = [type];
    }

    return this.notificationsRepo.findUserNotifications(
      userId,
      effectiveIsRead,
      types,
      page,
      limit,
    );
  }

  async markAsRead(userId: string, id: string): Promise<boolean> {
    const success = await this.notificationsRepo.markAsReadTx(undefined, id, userId);
    if (!success) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Notification '${id}' not found.`,
        code: 'NOTIFICATION_NOT_FOUND',
      });
    }
    return true;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    return this.notificationsRepo.markAllAsReadTx(undefined, userId);
  }
}
