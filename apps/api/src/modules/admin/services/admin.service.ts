import { Injectable, ForbiddenException, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { count, eq, isNull, ilike, and, desc } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../../../database/database.constants';
import type { DrizzleDB } from '../../../database/database.module';
import { UsersRepository } from '../../../database/repositories/users.repository';
import { RolesRepository } from '../../../database/repositories/roles.repository';
import { SystemSettingsRepository } from '../../../database/repositories/system-settings.repository';
import { FeatureFlagsRepository } from '../../../database/repositories/feature-flags.repository';
import { AuditLogRepository } from '../../../database/repositories/audit-log.repository';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UpdateSystemSettingDto } from '../dto/update-system-setting.dto';
import { ToggleFeatureFlagDto } from '../dto/toggle-feature-flag.dto';
import { postsTable, reportsTable, usersTable, profilesTable, mediaTable } from '../../../database/schema';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB,
    private readonly usersRepo: UsersRepository,
    private readonly rolesRepo: RolesRepository,
    private readonly systemSettingsRepo: SystemSettingsRepository,
    private readonly featureFlagsRepo: FeatureFlagsRepository,
    private readonly auditLogRepo: AuditLogRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getOverview() {
    const [posts, activeUsers, reviewQueue, openReports] = await Promise.all([
      this.db.select({ value: count() }).from(postsTable).where(isNull(postsTable.deletedAt)),
      this.db.select({ value: count() }).from(usersTable).where(eq(usersTable.status, 'ACTIVE')),
      this.db.select({ value: count() }).from(postsTable).where(eq(postsTable.moderationStatus, 'UNREVIEWED')),
      this.db.select({ value: count() }).from(reportsTable).where(eq(reportsTable.status, 'OPEN')),
    ]);

    return {
      totalPosts: Number(posts[0]?.value ?? 0),
      activeUsers: Number(activeUsers[0]?.value ?? 0),
      reviewQueue: Number(reviewQueue[0]?.value ?? 0),
      openReports: Number(openReports[0]?.value ?? 0),
      generatedAt: new Date().toISOString(),
    };
  }

  async getUsers(page = 1, limit = 20, search?: string, status?: string) {
    const filters = [] as any[];
    if (search?.trim()) filters.push(ilike(usersTable.email, `%${search.trim()}%`));
    if (status) filters.push(eq(usersTable.status, status));
    const where = filters.length ? and(...filters) : undefined;
    const [rows, total] = await Promise.all([
      this.db.select({
        id: usersTable.id,
        email: usersTable.email,
        status: usersTable.status,
        provider: usersTable.provider,
        createdAt: usersTable.createdAt,
        displayName: profilesTable.displayName,
        username: profilesTable.username,
        avatarUrl: mediaTable.secureUrl,
      }).from(usersTable).leftJoin(profilesTable, eq(profilesTable.userId, usersTable.id)).leftJoin(mediaTable, eq(mediaTable.id, profilesTable.avatarMediaId)).where(where).orderBy(desc(usersTable.createdAt)).limit(limit).offset((page - 1) * limit),
      this.db.select({ value: count() }).from(usersTable).where(where),
    ]);
    const data = await Promise.all(rows.map(async (user) => ({ ...user, roles: await this.rolesRepo.getUserRoles(user.id) })));
    const totalItems = Number(total[0]?.value ?? 0);
    const totalPages = Math.ceil(totalItems / limit);
    return { data, meta: { page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 } };
  }

  async changeUserStatus(adminId: string, adminRoles: string[], targetUserId: string, dto: UpdateUserStatusDto) {
    if (adminId === targetUserId) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Administrators cannot modify their own account status.',
        code: 'CANNOT_MODIFY_SELF_STATUS',
      });
    }

    const targetUser = await this.usersRepo.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Target user '${targetUserId}' not found.`,
        code: 'USER_NOT_FOUND',
      });
    }

    const targetRoles = await this.rolesRepo.getUserRoles(targetUserId);
    const isTargetSuperAdmin = targetRoles.includes('SUPER_ADMIN');
    const isTargetAdmin = targetRoles.includes('ADMIN');
    const isCallerSuperAdmin = adminRoles.includes('SUPER_ADMIN');

    if (isTargetSuperAdmin && !isCallerSuperAdmin) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Only SUPER_ADMIN can modify a SUPER_ADMIN user status.',
        code: 'PROTECTED_SUPER_ADMIN_STATUS',
      });
    }

    if (isTargetAdmin && !isCallerSuperAdmin) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'ADMIN cannot modify another ADMIN user status.',
        code: 'PRIVILEGE_ESCALATION_DENIED',
      });
    }

    return await this.db.transaction(async (tx) => {
      const updated = await this.usersRepo.updateStatusTx(tx, targetUserId, dto.status);

      await this.auditLogService.log(
        {
          actor_id: adminId,
          action: 'USER_STATUS_CHANGE',
          entity_type: 'users',
          entity_id: targetUserId,
          reason: dto.reason,
          metadata: { newStatus: dto.status },
        },
        tx,
      );

      return updated;
    });
  }

  async assignRole(adminId: string, adminRoles: string[], dto: AssignRoleDto) {
    if (adminId === dto.userId) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Administrators cannot modify their own roles.',
        code: 'CANNOT_MODIFY_SELF_ROLE',
      });
    }

    const isCallerSuperAdmin = adminRoles.includes('SUPER_ADMIN');

    if ((dto.roleName === 'SUPER_ADMIN' || dto.roleName === 'ADMIN') && !isCallerSuperAdmin) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: `Only SUPER_ADMIN can assign '${dto.roleName}' role.`,
        code: 'PRIVILEGE_ESCALATION_DENIED',
      });
    }

    const targetRoles = await this.rolesRepo.getUserRoles(dto.userId);
    if ((targetRoles.includes('ADMIN') || targetRoles.includes('SUPER_ADMIN')) && !isCallerSuperAdmin) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'ADMIN cannot modify another ADMIN or SUPER_ADMIN roles.',
        code: 'PRIVILEGE_ESCALATION_DENIED',
      });
    }

    const role = await this.rolesRepo.findByName(dto.roleName);
    if (!role) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Role '${dto.roleName}' not found.`,
        code: 'ROLE_NOT_FOUND',
      });
    }

    return await this.db.transaction(async (tx) => {
      await this.rolesRepo.assignRoleTx(tx, dto.userId, role.id);

      await this.auditLogService.log(
        {
          actor_id: adminId,
          action: 'ROLE_ASSIGN',
          entity_type: 'users',
          entity_id: dto.userId,
          metadata: { assignedRole: dto.roleName },
        },
        tx,
      );

      return { assigned: true, roleName: dto.roleName, userId: dto.userId };
    });
  }

  async revokeRole(adminId: string, adminRoles: string[], dto: AssignRoleDto) {
    if (adminId === dto.userId) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Administrators cannot modify their own roles.',
        code: 'CANNOT_MODIFY_SELF_ROLE',
      });
    }

    const isCallerSuperAdmin = adminRoles.includes('SUPER_ADMIN');

    if ((dto.roleName === 'SUPER_ADMIN' || dto.roleName === 'ADMIN') && !isCallerSuperAdmin) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: `Only SUPER_ADMIN can revoke '${dto.roleName}' role.`,
        code: 'PRIVILEGE_ESCALATION_DENIED',
      });
    }

    const targetRoles = await this.rolesRepo.getUserRoles(dto.userId);
    if ((targetRoles.includes('ADMIN') || targetRoles.includes('SUPER_ADMIN')) && !isCallerSuperAdmin) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'ADMIN cannot modify another ADMIN or SUPER_ADMIN roles.',
        code: 'PRIVILEGE_ESCALATION_DENIED',
      });
    }

    const role = await this.rolesRepo.findByName(dto.roleName);
    if (!role) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Role '${dto.roleName}' not found.`,
        code: 'ROLE_NOT_FOUND',
      });
    }

    return await this.db.transaction(async (tx) => {
      const revoked = await this.rolesRepo.revokeRoleTx(tx, dto.userId, role.id);

      await this.auditLogService.log(
        {
          actor_id: adminId,
          action: 'ROLE_REVOKE',
          entity_type: 'users',
          entity_id: dto.userId,
          metadata: { revokedRole: dto.roleName },
        },
        tx,
      );

      return { revoked, roleName: dto.roleName, userId: dto.userId };
    });
  }

  async getSystemSettings() {
    return this.systemSettingsRepo.findAll();
  }

  async updateSystemSetting(adminId: string, adminRoles: string[], key: string, dto: UpdateSystemSettingDto) {
    return await this.db.transaction(async (tx) => {
      const setting = await this.systemSettingsRepo.upsertTx(tx, key, dto.value, dto.description);

      await this.auditLogService.log(
        {
          actor_id: adminId,
          action: 'SYSTEM_SETTING_UPDATE',
          entity_type: 'system_settings',
          entity_id: key,
          metadata: { value: dto.value },
        },
        tx,
      );

      return setting;
    });
  }

  async getPublicFeatureFlags(): Promise<Record<string, boolean>> {
    const flags = await this.featureFlagsRepo.findAll();
    const map: Record<string, boolean> = {};
    for (const f of flags) {
      map[f.key] = f.isEnabled;
    }
    return map;
  }

  async getAdminFeatureFlags() {
    return this.featureFlagsRepo.findAll();
  }

  async toggleFeatureFlag(adminId: string, adminRoles: string[], key: string, dto: ToggleFeatureFlagDto) {
    return await this.db.transaction(async (tx) => {
      const flag = await this.featureFlagsRepo.toggleTx(tx, key, dto.isEnabled, dto.description);

      await this.auditLogService.log(
        {
          actor_id: adminId,
          action: 'FEATURE_FLAG_TOGGLE',
          entity_type: 'feature_flags',
          entity_id: key,
          metadata: { isEnabled: dto.isEnabled },
        },
        tx,
      );

      return flag;
    });
  }

  async getAuditLogs(page = 1, limit = 20, actorId?: string, entityType?: string, action?: string) {
    return this.auditLogRepo.findLogsPaginated(page, limit, actorId, entityType, action);
  }
}
