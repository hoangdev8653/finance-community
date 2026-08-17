import { Injectable, Inject } from '@nestjs/common';
import { eq, count, desc } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { moderationActionsTable } from '../schema/moderation-actions.schema';

export type ModerationActionEntity = typeof moderationActionsTable.$inferSelect;
export type NewModerationActionEntity = typeof moderationActionsTable.$inferInsert;

@Injectable()
export class ModerationActionsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async createTx(tx: any, data: NewModerationActionEntity): Promise<ModerationActionEntity> {
    const client = tx || this.db;
    const [record] = await client.insert(moderationActionsTable).values(data).returning();
    return record;
  }

  async findHistoryByTargetUser(targetUserId: string, page = 1, limit = 20): Promise<{ data: ModerationActionEntity[]; meta: any }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(moderationActionsTable)
      .where(eq(moderationActionsTable.targetUserId, targetUserId));

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit);

    const data = await this.db
      .select()
      .from(moderationActionsTable)
      .where(eq(moderationActionsTable.targetUserId, targetUserId))
      .orderBy(desc(moderationActionsTable.createdAt))
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
}
