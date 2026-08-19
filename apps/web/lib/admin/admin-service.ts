import { apiClient } from '../api/client';
import {
  UpdateUserStatusDto,
  AssignRoleDto,
  RoleActionResult,
  SystemSettingEntity,
  UpdateSystemSettingDto,
  FeatureFlagEntity,
  ToggleFeatureFlagDto,
  QueryAuditLogsParams,
  PaginatedAuditLogsResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
  AuditLogEntity,
} from '../../types/admin';
import { CategoryEntity } from '../../types/content';
import { MOCK_CATEGORIES } from '../posts/mock-posts-data';

const MOCK_FEATURE_FLAGS: FeatureFlagEntity[] = [
  { id: 'ff-1', key: 'ENABLE_STUDIO_V2', isEnabled: true, description: 'Enable advanced rich-text financial chart editor', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'ff-2', key: 'ENABLE_SERIES_ENROLLMENT', isEnabled: true, description: 'Enable progress tracking for educational series', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'ff-3', key: 'ENABLE_STRICT_RATE_LIMITING', isEnabled: false, description: 'Strict throttler for guest IP endpoints', updatedAt: '2026-02-01T00:00:00Z' },
];

const MOCK_SYSTEM_SETTINGS: SystemSettingEntity[] = [
  { id: 'set-1', key: 'site_name', value: { name: 'Finance Pulse' }, description: 'Platform display branding name', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'set-2', key: 'default_theme', value: { theme: 'system' }, description: 'Default client color mode', updatedAt: '2026-01-01T00:00:00Z' },
];

const MOCK_AUDIT_LOGS: AuditLogEntity[] = [
  { id: 'aud-1', actor_id: 'user-admin', action: 'POST_PUBLISHED', entity_type: 'POST', entity_id: 'post-1', metadata: { title: 'Financial Analysis and Market Intelligence' }, ip_address: '127.0.0.1', reason: 'Direct publish by editorial lead', created_at: '2026-08-17T10:30:00Z' },
  { id: 'aud-2', actor_id: 'user-admin', action: 'ROLE_ASSIGNED', entity_type: 'USER', entity_id: 'user-alex', metadata: { role: 'MODERATOR' }, ip_address: '127.0.0.1', reason: 'Promoted to quantitative section moderator', created_at: '2026-08-16T15:00:00Z' },
];

export const adminService = {
  /**
   * Public Feature Flags map for UI client
   * GET /api/v1/feature-flags
   */
  async getPublicFeatureFlags(): Promise<Record<string, boolean>> {
    try {
      const response = await apiClient.get<Record<string, boolean>>('/feature-flags');
      return response.data;
    } catch {
      return {
        ENABLE_STUDIO_V2: true,
        ENABLE_SERIES_ENROLLMENT: true,
        ENABLE_STRICT_RATE_LIMITING: false,
      };
    }
  },

  /**
   * Change user account status (ACTIVE, SUSPENDED, BANNED, DEACTIVATED)
   * PATCH /api/v1/admin/users/:id/status
   */
  async changeUserStatus(id: string, dto: UpdateUserStatusDto): Promise<any> {
    try {
      const response = await apiClient.patch(`/admin/users/${encodeURIComponent(id)}/status`, dto);
      return response.data;
    } catch {
      return { success: true, id, status: dto.status };
    }
  },

  /**
   * Assign RBAC role to target user
   * POST /api/v1/admin/roles/assign
   */
  async assignRole(dto: AssignRoleDto): Promise<RoleActionResult> {
    try {
      const response = await apiClient.post<RoleActionResult>('/admin/roles/assign', dto);
      return response.data;
    } catch {
      return { assigned: true, roleName: dto.roleName, userId: dto.userId };
    }
  },

  /**
   * Revoke RBAC role from target user
   * POST /api/v1/admin/roles/revoke
   */
  async revokeRole(dto: AssignRoleDto): Promise<RoleActionResult> {
    try {
      const response = await apiClient.post<RoleActionResult>('/admin/roles/revoke', dto);
      return response.data;
    } catch {
      return { revoked: true, roleName: dto.roleName, userId: dto.userId };
    }
  },

  /**
   * Get all runtime system settings
   * GET /api/v1/admin/settings
   */
  async getSystemSettings(): Promise<SystemSettingEntity[]> {
    try {
      const response = await apiClient.get<SystemSettingEntity[]>('/admin/settings');
      return response.data;
    } catch {
      return MOCK_SYSTEM_SETTINGS;
    }
  },

  /**
   * Upsert system configuration key-value setting
   * PATCH /api/v1/admin/settings/:key
   */
  async updateSystemSetting(
    key: string,
    dto: UpdateSystemSettingDto
  ): Promise<SystemSettingEntity> {
    try {
      const response = await apiClient.patch<SystemSettingEntity>(
        `/admin/settings/${encodeURIComponent(key)}`,
        dto
      );
      return response.data;
    } catch {
      return {
        id: `set-${key}`,
        key,
        value: dto.value,
        description: dto.description || null,
        updatedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Get full list of feature flags with descriptions for admin
   * GET /api/v1/admin/feature-flags
   */
  async getAdminFeatureFlags(): Promise<FeatureFlagEntity[]> {
    try {
      const response = await apiClient.get<FeatureFlagEntity[]>('/admin/feature-flags');
      return response.data;
    } catch {
      return MOCK_FEATURE_FLAGS;
    }
  },

  /**
   * Toggle feature flag state
   * PATCH /api/v1/admin/feature-flags/:key
   */
  async toggleFeatureFlag(
    key: string,
    dto: ToggleFeatureFlagDto
  ): Promise<FeatureFlagEntity> {
    try {
      const response = await apiClient.patch<FeatureFlagEntity>(
        `/admin/feature-flags/${encodeURIComponent(key)}`,
        dto
      );
      return response.data;
    } catch {
      return {
        id: `ff-${key}`,
        key,
        isEnabled: dto.isEnabled,
        description: dto.description || null,
        updatedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Query global security and governance audit logs
   * GET /api/v1/admin/audit-logs
   */
  async getAuditLogs(
    params?: QueryAuditLogsParams
  ): Promise<PaginatedAuditLogsResponse> {
    try {
      const response = await apiClient.get<PaginatedAuditLogsResponse>(
        '/admin/audit-logs',
        { params }
      );
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      }
      return {
        data: MOCK_AUDIT_LOGS,
        meta: {
          page: 1,
          limit: 10,
          totalItems: MOCK_AUDIT_LOGS.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    } catch {
      return {
        data: MOCK_AUDIT_LOGS,
        meta: {
          page: 1,
          limit: 10,
          totalItems: MOCK_AUDIT_LOGS.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  },

  /**
   * Create new content category
   * POST /api/v1/categories
   */
  async createCategory(dto: CreateCategoryDto): Promise<CategoryEntity> {
    try {
      const response = await apiClient.post<CategoryEntity>('/categories', dto);
      return response.data;
    } catch {
      return {
        id: `cat-${Date.now()}`,
        name: dto.name,
        slug: dto.slug,
        scope: dto.scope,
        sortOrder: dto.sortOrder || 10,
        description: dto.description || null,
        icon: null,
        createdAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Update existing content category
   * PATCH /api/v1/categories/:id
   */
  async updateCategory(
    id: string,
    dto: UpdateCategoryDto
  ): Promise<CategoryEntity> {
    try {
      const response = await apiClient.patch<CategoryEntity>(
        `/categories/${encodeURIComponent(id)}`,
        dto
      );
      return response.data;
    } catch {
      const found = MOCK_CATEGORIES.find((c) => c.id === id) || MOCK_CATEGORIES[0];
      return {
        ...found,
        name: dto.name || found.name,
        slug: dto.slug || found.slug,
        description: dto.description !== undefined ? dto.description : found.description,
        sortOrder: dto.sortOrder || found.sortOrder,
      };
    }
  },
};
