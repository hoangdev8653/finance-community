import { Injectable, Inject } from '@nestjs/common';
import { eq, and, count, desc, inArray } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { reportsTable } from '../schema/reports.schema';

export type ReportEntity = typeof reportsTable.$inferSelect;
export type NewReportEntity = typeof reportsTable.$inferInsert;

@Injectable()
export class ReportsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async createTx(tx: any, data: NewReportEntity): Promise<ReportEntity> {
    const client = tx || this.db;
    const [record] = await client.insert(reportsTable).values(data).returning();
    return record;
  }

  async findById(id: string): Promise<ReportEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.id, id));
    return record;
  }

  async findActiveReportForTarget(
    reporterId: string,
    targetType: 'POST' | 'COMMENT' | 'USER',
    targetId: string,
  ): Promise<ReportEntity | undefined> {
    let targetCondition;
    if (targetType === 'POST') {
      targetCondition = eq(reportsTable.reportedPostId, targetId);
    } else if (targetType === 'COMMENT') {
      targetCondition = eq(reportsTable.reportedCommentId, targetId);
    } else {
      targetCondition = eq(reportsTable.reportedUserId, targetId);
    }

    const [existing] = await this.db
      .select()
      .from(reportsTable)
      .where(
        and(
          eq(reportsTable.reporterId, reporterId),
          targetCondition,
          inArray(reportsTable.status, ['OPEN', 'PENDING', 'REVIEWING']),
        ),
      );
    return existing;
  }

  async countActiveReportsForTarget(
    targetType: 'POST' | 'COMMENT',
    targetId: string,
  ): Promise<number> {
    const targetCondition =
      targetType === 'POST'
        ? eq(reportsTable.reportedPostId, targetId)
        : eq(reportsTable.reportedCommentId, targetId);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(reportsTable)
      .where(and(targetCondition, inArray(reportsTable.status, ['OPEN', 'PENDING', 'REVIEWING'])));

    return Number(total);
  }

  async findQueuePaginated(status?: string, page = 1, limit = 20): Promise<{ data: ReportEntity[]; meta: any }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const whereClause = status ? eq(reportsTable.status, status) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(reportsTable)
      .where(whereClause);

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit);

    const data = await this.db
      .select()
      .from(reportsTable)
      .where(whereClause)
      .orderBy(desc(reportsTable.createdAt))
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

  async updateStatusTx(tx: any, id: string, status: string, resolvedAt?: Date): Promise<ReportEntity | undefined> {
    const client = tx || this.db;
    const [updated] = await client
      .update(reportsTable)
      .set({ status, resolvedAt: status === 'RESOLVED' || status === 'DISMISSED' ? (resolvedAt || new Date()) : null })
      .where(eq(reportsTable.id, id))
      .returning();
    return updated;
  }
}
