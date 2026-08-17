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

  async getUserNotifications(userId: string, isRead?: boolean, page = 1, limit = 20) {
    return this.notificationsRepo.findUserNotifications(userId, isRead, page, limit);
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
