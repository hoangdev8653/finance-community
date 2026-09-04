import { Injectable, ForbiddenException, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { count, eq, isNull, ilike, and, or, desc, gte } from 'drizzle-orm';
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
import { UpdateCommentStatusDto } from '../dto/update-comment-status.dto';
import { postsTable, reportsTable, usersTable, profilesTable, mediaTable, commentsTable, categoriesTable, tagsTable, domainsTable } from '../../../database/schema';

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
    // Generate 7-day day buckets
    const days: { start: Date; end: Date; dateStr: string; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const label = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(d);
      days.push({ start, end, dateStr, label });
    }
    const sevenDaysAgo = days[0].start;

    const [
      posts,
      activeUsers,
      reviewQueue,
      openReports,
      recentUsers,
      allUsersByStatus,
      recentPosts,
      publishedPosts,
      draftPosts,
      comments,
      media,
      categories,
      tags,
    ] = await Promise.all([
      this.db.select({ value: count() }).from(postsTable).where(isNull(postsTable.deletedAt)),
      this.db.select({ value: count() }).from(usersTable).where(eq(usersTable.status, 'ACTIVE')),
      this.db.select({ value: count() }).from(postsTable).where(eq(postsTable.moderationStatus, 'UNREVIEWED')),
      this.db.select({ value: count() }).from(reportsTable).where(eq(reportsTable.status, 'OPEN')),
      this.db.select({ createdAt: usersTable.createdAt }).from(usersTable).where(gte(usersTable.createdAt, sevenDaysAgo)),
      this.db.select({ status: usersTable.status, count: count() }).from(usersTable).groupBy(usersTable.status),
      this.db.select({ createdAt: postsTable.createdAt }).from(postsTable).where(and(isNull(postsTable.deletedAt), gte(postsTable.createdAt, sevenDaysAgo))),
      this.db.select({ value: count() }).from(postsTable).where(and(isNull(postsTable.deletedAt), eq(postsTable.status, 'PUBLISHED'))),
      this.db.select({ value: count() }).from(postsTable).where(and(isNull(postsTable.deletedAt), eq(postsTable.status, 'DRAFT'))),
      this.db.select({ value: count() }).from(commentsTable).where(isNull(commentsTable.deletedAt)),
      this.db.select({ value: count() }).from(mediaTable).where(isNull(mediaTable.deletedAt)),
      this.db.select({ value: count() }).from(categoriesTable).where(eq(categoriesTable.isActive, true)),
      this.db.select({ value: count() }).from(tagsTable),
    ]);

    // Aggregate user growth series
    const userGrowthSeries = days.map((day) => {
      const matching = (recentUsers || []).filter((u) => {
        const time = new Date(u.createdAt).getTime();
        return time >= day.start.getTime() && time <= day.end.getTime();
      });
      return {
        date: day.dateStr,
        label: day.label,
        count: matching.length,
      };
    });

    // Aggregate post growth series
    const postGrowthSeries = days.map((day) => {
      const matching = (recentPosts || []).filter((p) => {
        const time = new Date(p.createdAt).getTime();
        return time >= day.start.getTime() && time <= day.end.getTime();
      });
      return {
        date: day.dateStr,
        label: day.label,
        count: matching.length,
      };
    });

    // User status breakdown
    const userStatusBreakdown = {
      active: 0,
      suspended: 0,
      pending: 0,
    };
    (allUsersByStatus || []).forEach((row) => {
      const st = String(row.status || '').toUpperCase();
      const val = Number(row.count ?? 0);
      if (st === 'ACTIVE') userStatusBreakdown.active += val;
      else if (st === 'SUSPENDED') userStatusBreakdown.suspended += val;
      else userStatusBreakdown.pending += val;
    });

    return {
      totalPosts: Number(posts[0]?.value ?? 0),
      activeUsers: Number(activeUsers[0]?.value ?? 0),
      reviewQueue: Number(reviewQueue[0]?.value ?? 0),
      openReports: Number(openReports[0]?.value ?? 0),
      userGrowthSeries,
      userStatusBreakdown,
      postGrowthSeries,
      postStatusBreakdown: {
        published: Number(publishedPosts[0]?.value ?? 0),
        draft: Number(draftPosts[0]?.value ?? 0),
        unreviewed: Number(reviewQueue[0]?.value ?? 0),
      },
      totalComments: Number(comments[0]?.value ?? 0),
      totalMedia: Number(media[0]?.value ?? 0),
      activeCategories: Number(categories[0]?.value ?? 0),
      activeTags: Number(tags[0]?.value ?? 0),
      generatedAt: new Date().toISOString(),
    };
  }

  async getPopularPosts(limit = 5) {
    const domainLabels: Record<string, string> = { MONEY: 'Tài chính', BUSINESS: 'Kinh doanh', TECH: 'Công nghệ', CAREER: 'Nghề nghiệp & Học tập', LIFE: 'Đời sống', SPORTS: 'Thể thao', GENERAL: 'Khác' };
    const categoryLabels: Record<string, string> = { 'stock-market': 'Chứng khoán', ai: 'Trí tuệ nhân tạo', 'tai-chinh-ca-nhan': 'Tài chính cá nhân', career: 'Nghề nghiệp', macroeconomics: 'Vĩ mô', football: 'Bóng đá', business: 'Doanh nghiệp', startup: 'Khởi nghiệp', software: 'Phần mềm', health: 'Sức khỏe' };
    return this.db.select({
      id: postsTable.id, title: postsTable.title, slug: postsTable.slug, contentType: postsTable.contentType, viewCount: postsTable.viewCount,
      authorName: profilesTable.displayName, authorUsername: profilesTable.username,
      categoryName: categoriesTable.name, categorySlug: categoriesTable.slug, categoryNameVi: categoriesTable.nameVi,
      domainCode: domainsTable.code, domainName: domainsTable.name, domainNameVi: domainsTable.nameVi,
      commentCount: count(commentsTable.id),
    }).from(postsTable)
      .leftJoin(profilesTable, eq(profilesTable.userId, postsTable.authorId))
      .leftJoin(categoriesTable, eq(categoriesTable.id, postsTable.categoryId))
      .leftJoin(domainsTable, eq(domainsTable.id, postsTable.domainId))
      .leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
      .where(and(isNull(postsTable.deletedAt), eq(postsTable.status, 'PUBLISHED')))
      .groupBy(postsTable.id, profilesTable.displayName, profilesTable.username, categoriesTable.name, categoriesTable.slug, categoriesTable.nameVi, domainsTable.code, domainsTable.name, domainsTable.nameVi)
      .orderBy(desc(postsTable.viewCount)).limit(limit)
      .then((posts) => posts.map((post) => ({ ...post, domainNameVi: domainLabels[post.domainCode || ''] || post.domainNameVi || post.domainName, categoryNameVi: categoryLabels[post.categorySlug || ''] || post.categoryNameVi || post.categoryName })));
  }

  async getPostCategoryStats() {
    const domainLabels: Record<string, string> = {
      MONEY: 'Tài chính', BUSINESS: 'Kinh doanh', TECH: 'Công nghệ', CAREER: 'Nghề nghiệp & Học tập', LIFE: 'Đời sống', SPORTS: 'Thể thao', GENERAL: 'Khác',
    };
    const rows = await this.db.select({
      domainId: domainsTable.id,
      domainCode: domainsTable.code,
      domainName: domainsTable.name,
      domainNameVi: domainsTable.nameVi,
      categoryId: categoriesTable.id,
      categoryName: categoriesTable.name,
      categoryNameVi: categoriesTable.nameVi,
      postCount: count(postsTable.id),
    }).from(domainsTable)
      .leftJoin(categoriesTable, and(eq(categoriesTable.domainId, domainsTable.id), eq(categoriesTable.isActive, true)))
      .leftJoin(postsTable, and(eq(postsTable.categoryId, categoriesTable.id), eq(postsTable.status, 'PUBLISHED'), isNull(postsTable.deletedAt)))
      .where(eq(domainsTable.isActive, true))
      .groupBy(domainsTable.id, domainsTable.code, domainsTable.name, domainsTable.nameVi, categoriesTable.id, categoriesTable.name, categoriesTable.nameVi)
      .orderBy(desc(count(postsTable.id)), domainsTable.sortOrder);
    const grouped = new Map<string, any>();
    for (const row of rows) {
      if (!grouped.has(row.domainId)) grouped.set(row.domainId, { domainId: row.domainId, domainCode: row.domainCode, domainName: row.domainName, domainNameVi: row.domainNameVi, postCount: 0, categories: [] });
      const domain = grouped.get(row.domainId);
      const postCount = Number(row.postCount);
      domain.postCount += postCount;
      if (row.categoryId) domain.categories.push({ categoryId: row.categoryId, categoryName: row.categoryName, categoryNameVi: row.categoryNameVi, postCount });
    }
    return Array.from(grouped.values()).map((domain) => ({
      categoryId: domain.domainId,
      categoryName: domainLabels[domain.domainCode] || domain.domainName,
      postCount: domain.postCount,
      domainId: domain.domainId,
      domainCode: domain.domainCode,
      domainName: domain.domainNameVi || domain.domainName,
      categories: domain.categories,
    }));
  }

  async getUsers(page = 1, limit = 20, search?: string, status?: string) {
    const filters = [] as any[];
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      filters.push(or(
        ilike(usersTable.email, term),
        ilike(usersTable.id, term),
        ilike(profilesTable.username, term),
        ilike(profilesTable.displayName, term),
      ));
    }
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

  async getComments(page = 1, limit = 20, status?: string, search?: string) {
    const filters = [] as any[];
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      filters.push(
        or(
          ilike(commentsTable.body, term),
          ilike(postsTable.title, term),
          ilike(profilesTable.username, term),
          ilike(profilesTable.displayName, term),
        ),
      );
    }
    if (status && status !== 'ALL') {
      filters.push(eq(commentsTable.status, status));
    }
    const where = filters.length ? and(...filters) : undefined;
    const [rows, total] = await Promise.all([
      this.db
        .select({
          id: commentsTable.id,
          postId: commentsTable.postId,
          postTitle: postsTable.title,
          authorId: commentsTable.authorId,
          authorUsername: profilesTable.username,
          authorDisplayName: profilesTable.displayName,
          body: commentsTable.body,
          status: commentsTable.status,
          createdAt: commentsTable.createdAt,
          updatedAt: commentsTable.updatedAt,
          deletedAt: commentsTable.deletedAt,
        })
        .from(commentsTable)
        .leftJoin(postsTable, eq(postsTable.id, commentsTable.postId))
        .leftJoin(profilesTable, eq(profilesTable.userId, commentsTable.authorId))
        .where(where)
        .orderBy(desc(commentsTable.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db
        .select({ value: count() })
        .from(commentsTable)
        .leftJoin(postsTable, eq(postsTable.id, commentsTable.postId))
        .leftJoin(profilesTable, eq(profilesTable.userId, commentsTable.authorId))
        .where(where),
    ]);
    const totalItems = Number(total[0]?.value ?? 0);
    const totalPages = Math.ceil(totalItems / limit);
    return {
      data: rows,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateCommentStatus(
    adminId: string,
    adminRoles: string[],
    commentId: string,
    dto: UpdateCommentStatusDto,
  ) {
    const [comment] = await this.db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.id, commentId));

    if (!comment) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Comment with ID '${commentId}' not found.`,
        code: 'COMMENT_NOT_FOUND',
      });
    }

    return await this.db.transaction(async (tx) => {
      const updateData: any = {
        status: dto.status,
        updatedAt: new Date(),
      };
      if (dto.status === 'HIDDEN') {
        updateData.deletedAt = new Date();
      } else {
        updateData.deletedAt = null;
      }

      const [updated] = await tx
        .update(commentsTable)
        .set(updateData)
        .where(eq(commentsTable.id, commentId))
        .returning();

      await this.auditLogService.log(
        {
          actor_id: adminId,
          action: dto.status === 'HIDDEN' ? 'COMMENT_HIDE' : 'COMMENT_UNHIDE',
          entity_type: 'comments',
          entity_id: commentId,
          metadata: {
            previousStatus: comment.status,
            newStatus: dto.status,
            reason: dto.reason,
          },
        },
        tx,
      );

      return updated;
    });
  }
}

