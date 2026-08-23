import { Injectable, Inject } from '@nestjs/common';
import { eq, and, count, desc, lt } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { auditLogsTable } from '../schema/audit-logs.schema';
import { usersTable } from '../schema/users.schema';

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
      .select({
        id: auditLogsTable.id,
        actorId: auditLogsTable.actorId,
        actorEmail: usersTable.email,
        action: auditLogsTable.action,
        entityType: auditLogsTable.entityType,
        entityId: auditLogsTable.entityId,
        metadata: auditLogsTable.metadata,
        ipAddress: auditLogsTable.ipAddress,
        reason: auditLogsTable.reason,
        createdAt: auditLogsTable.createdAt,
      })
      .from(auditLogsTable)
      .leftJoin(usersTable, eq(auditLogsTable.actorId, usersTable.id))
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

  async deleteOlderThan(days = 7): Promise<number> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const deleted = await this.db.delete(auditLogsTable).where(lt(auditLogsTable.createdAt, cutoff)).returning({ id: auditLogsTable.id });
    return deleted.length;
  }
}
