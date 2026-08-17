import { Injectable, Inject } from '@nestjs/common';
import { eq, and, count, desc } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { auditLogsTable } from '../schema/audit-logs.schema';

export type AuditLogEntity = typeof auditLogsTable.$inferSelect;
export type NewAuditLogEntity = typeof auditLogsTable.$inferInsert;

@Injectable()
export class AuditLogRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async insertLogTx(tx: any, data: NewAuditLogEntity): Promise<AuditLogEntity> {
    const client = tx || this.db;
    const [record] = await client.insert(auditLogsTable).values(data).returning();
    return record;
  }

  async findAll(limit = 100): Promise<AuditLogEntity[]> {
    return this.db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(limit);
  }

  async findLogsPaginated(
    page = 1,
    limit = 20,
    actorId?: string,
    entityType?: string,
    action?: string,
  ): Promise<{ data: AuditLogEntity[]; meta: any }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const conditions: any[] = [];
    if (actorId) conditions.push(eq(auditLogsTable.actorId, actorId));
    if (entityType) conditions.push(eq(auditLogsTable.entityType, entityType));
    if (action) conditions.push(eq(auditLogsTable.action, action));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(auditLogsTable)
      .where(whereClause);

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit);

    const data = await this.db
      .select()
      .from(auditLogsTable)
      .where(whereClause)
      .orderBy(desc(auditLogsTable.createdAt))
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
