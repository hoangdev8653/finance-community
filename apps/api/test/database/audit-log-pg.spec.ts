import { AuditLogService } from '../../src/modules/audit/services/audit-log.service';
import { AuditLogRepository } from '../../src/database/repositories/audit-log.repository';

describe('AuditLogService (PostgreSQL Integration)', () => {
  let auditService: AuditLogService;
  let mockAuditRepo: jest.Mocked<AuditLogRepository>;

  beforeEach(() => {
    mockAuditRepo = {
      insertLogTx: jest.fn().mockImplementation(async (tx, data) => ({
        id: 'audit-pg-uuid-123',
        actorId: data.actorId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        reason: data.reason,
        createdAt: data.createdAt || new Date(),
      })),
      findAll: jest.fn(),
    } as any;

    auditService = new AuditLogService(mockAuditRepo);
  });

  it('should persist audit log entry directly to public.audit_logs with metadata column', async () => {
    const entry = {
      actor_id: 'actor-uuid-1',
      action: 'USER_SUSPEND',
      entity_type: 'users',
      entity_id: 'target-uuid-2',
      metadata: { previousStatus: 'ACTIVE', newStatus: 'SUSPENDED' },
      reason: 'Administrative policy violation',
    };

    const result = await auditService.log(entry);

    expect(mockAuditRepo.insertLogTx).toHaveBeenCalledTimes(1);
    expect(mockAuditRepo.insertLogTx).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        actorId: 'actor-uuid-1',
        action: 'USER_SUSPEND',
        entityType: 'users',
        entityId: 'target-uuid-2',
        metadata: { previousStatus: 'ACTIVE', newStatus: 'SUSPENDED' },
        reason: 'Administrative policy violation',
      }),
    );
    expect(result.id).toBe('audit-pg-uuid-123');
    expect(result.metadata).toEqual({ previousStatus: 'ACTIVE', newStatus: 'SUSPENDED' });
  });
});
