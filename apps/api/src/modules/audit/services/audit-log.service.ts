import { Injectable, Logger, Optional, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AuditLogRepository } from '../../../database/repositories/audit-log.repository';

export interface AuditLogEntry {
  id?: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata?: Record<string, any> | null;
  ip_address?: string | null;
  reason?: string | null;
  created_at?: Date;
}

const isDbOffline = (err: any): boolean => {
  if (!err) return false;
  const code = err.code || err.cause?.code || err.cause?.errors?.[0]?.code;
  const name = err.name || err.cause?.name;
  const msg = (err.message || '') + (err.cause?.message || '');
  return (
    code === 'ECONNREFUSED' ||
    code === '57P01' ||
    code === '08006' ||
    name === 'AggregateError' ||
    msg.includes('ECONNREFUSED')
  );
};

@Injectable()
export class AuditLogService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuditLogService.name);
  private readonly logsStore: AuditLogEntry[] = [];
  private cleanupTimer?: NodeJS.Timeout;

  constructor(@Optional() private readonly auditRepo?: AuditLogRepository) {}

  async onModuleInit() {
    await this.cleanupExpiredLogs();
    this.cleanupTimer = setInterval(() => void this.cleanupExpiredLogs(), 24 * 60 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }

  private async cleanupExpiredLogs() {
    if (!this.auditRepo) return;
    try {
      const deleted = await this.auditRepo.deleteOlderThan(7);
      if (deleted > 0) this.logger.log(`Audit retention cleanup removed ${deleted} log(s) older than 7 days.`);
    } catch (error: any) {
      this.logger.warn(`Audit retention cleanup failed: ${error?.message || error}`);
    }
  }

  /**
   * Writes an immutable security/administrative record matching Phase 1 public.audit_logs schema.
   */
  async log(entry: AuditLogEntry, tx?: any): Promise<AuditLogEntry> {
    const record: AuditLogEntry = {
      id: entry.id,
      actor_id: entry.actor_id,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      metadata: entry.metadata || null,
      ip_address: entry.ip_address || null,
      reason: entry.reason || null,
      created_at: entry.created_at || new Date(),
    };

    if (this.auditRepo) {
      try {
        const persisted = await this.auditRepo.insertLogTx(tx, {
          actorId: record.actor_id as any,
          action: record.action,
          entityType: record.entity_type,
          entityId: record.entity_id,
          metadata: record.metadata,
          ipAddress: record.ip_address,
          reason: record.reason,
          createdAt: record.created_at,
        });

        const auditRecord: AuditLogEntry = {
          id: persisted.id,
          actor_id: persisted.actorId,
          action: persisted.action,
          entity_type: persisted.entityType,
          entity_id: persisted.entityId,
          metadata: persisted.metadata as Record<string, any> | null,
          ip_address: persisted.ipAddress,
          reason: persisted.reason,
          created_at: persisted.createdAt,
        };

        this.logsStore.push(auditRecord);
        this.logger.log(
          `AUDIT [DB]: action=${auditRecord.action} actor=${auditRecord.actor_id} target=${auditRecord.entity_type}:${auditRecord.entity_id}`,
        );
        return auditRecord;
      } catch (err: any) {
        if (isDbOffline(err)) {
          this.logger.warn(`PostgreSQL audit store offline (${err.message || err.code}). Falling back to in-memory audit log store.`);
        } else {
          throw err;
        }
      }
    }

    record.id = record.id || `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.logsStore.push(record);
    this.logger.log(
      `AUDIT [MEM]: action=${record.action} actor=${record.actor_id} target=${record.entity_type}:${record.entity_id}`,
    );

    return record;
  }

  getLogs(): AuditLogEntry[] {
    return [...this.logsStore];
  }
}
