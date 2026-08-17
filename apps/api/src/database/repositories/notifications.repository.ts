import { Injectable, Inject } from '@nestjs/common';
import { eq, and, count, desc } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { notificationsTable } from '../schema/notifications.schema';

export type NotificationEntity = typeof notificationsTable.$inferSelect;
export type NewNotificationEntity = typeof notificationsTable.$inferInsert;

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async createTx(tx: any, data: NewNotificationEntity): Promise<NotificationEntity> {
    const client = tx || this.db;
    const [record] = await client.insert(notificationsTable).values(data).returning();
    return record;
  }

  async findUserNotifications(userId: string, isRead?: boolean, page = 1, limit = 20): Promise<{ data: NotificationEntity[]; meta: any }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    let whereClause = eq(notificationsTable.userId, userId);
    if (isRead !== undefined) {
      whereClause = and(whereClause, eq(notificationsTable.isRead, isRead)) as any;
    }

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(notificationsTable)
      .where(whereClause);

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit);

    const data = await this.db
      .select()
      .from(notificationsTable)
      .where(whereClause)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(safeLimit)
      .offset(offset);

    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
    };
  }

  async markAsReadTx(tx: any, id: string, userId: string): Promise<boolean> {
    const client = tx || this.db;
    const [updated] = await client
      .update(notificationsTable)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId)))
      .returning();
    return !!updated;
  }

  async markAllAsReadTx(tx: any, userId: string): Promise<boolean> {
    const client = tx || this.db;
    await client
      .update(notificationsTable)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));
    return true;
  }
}
