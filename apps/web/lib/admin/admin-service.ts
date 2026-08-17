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
} from '../../types/admin';
import { CategoryEntity } from '../../types/content';

export const adminService = {
  /**
   * Public Feature Flags map for UI client
   * GET /api/v1/feature-flags
   */
  async getPublicFeatureFlags(): Promise<Record<string, boolean>> {
    const response = await apiClient.get<Record<string, boolean>>('/feature-flags');
    return response.data;
  },

  /**
   * Change user account status (ACTIVE, SUSPENDED, BANNED, DEACTIVATED)
   * PATCH /api/v1/admin/users/:id/status
   */
  async changeUserStatus(id: string, dto: UpdateUserStatusDto): Promise<any> {
    const response = await apiClient.patch(`/admin/users/${encodeURIComponent(id)}/status`, dto);
    return response.data;
  },

  /**
   * Assign RBAC role to target user
   * POST /api/v1/admin/roles/assign
   */
  async assignRole(dto: AssignRoleDto): Promise<RoleActionResult> {
    const response = await apiClient.post<RoleActionResult>('/admin/roles/assign', dto);
    return response.data;
  },

  /**
   * Revoke RBAC role from target user
   * POST /api/v1/admin/roles/revoke
   */
  async revokeRole(dto: AssignRoleDto): Promise<RoleActionResult> {
    const response = await apiClient.post<RoleActionResult>('/admin/roles/revoke', dto);
    return response.data;
  },

  /**
   * Get all runtime system settings
   * GET /api/v1/admin/settings
   */
  async getSystemSettings(): Promise<SystemSettingEntity[]> {
    const response = await apiClient.get<SystemSettingEntity[]>('/admin/settings');
    return response.data;
  },

  /**
   * Upsert system configuration key-value setting
   * PATCH /api/v1/admin/settings/:key
   */
  async updateSystemSetting(
    key: string,
    dto: UpdateSystemSettingDto
  ): Promise<SystemSettingEntity> {
    const response = await apiClient.patch<SystemSettingEntity>(
      `/admin/settings/${encodeURIComponent(key)}`,
      dto
    );
    return response.data;
  },

  /**
   * Get full list of feature flags with descriptions for admin
   * GET /api/v1/admin/feature-flags
   */
  async getAdminFeatureFlags(): Promise<FeatureFlagEntity[]> {
    const response = await apiClient.get<FeatureFlagEntity[]>('/admin/feature-flags');
    return response.data;
  },

  /**
   * Toggle feature flag state
   * PATCH /api/v1/admin/feature-flags/:key
   */
  async toggleFeatureFlag(
    key: string,
    dto: ToggleFeatureFlagDto
  ): Promise<FeatureFlagEntity> {
    const response = await apiClient.patch<FeatureFlagEntity>(
      `/admin/feature-flags/${encodeURIComponent(key)}`,
      dto
    );
    return response.data;
  },

  /**
   * Query global security and governance audit logs
   * GET /api/v1/admin/audit-logs
   */
  async getAuditLogs(
    params?: QueryAuditLogsParams
  ): Promise<PaginatedAuditLogsResponse> {
    const response = await apiClient.get<PaginatedAuditLogsResponse>(
      '/admin/audit-logs',
      { params }
    );
    return response.data;
  },

  /**
   * Create new content category
   * POST /api/v1/categories
   */
  async createCategory(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const response = await apiClient.post<CategoryEntity>('/categories', dto);
    return response.data;
  },

  /**
   * Update existing content category
   * PATCH /api/v1/categories/:id
   */
  async updateCategory(
    id: string,
    dto: UpdateCategoryDto
  ): Promise<CategoryEntity> {
    const response = await apiClient.patch<CategoryEntity>(
      `/categories/${encodeURIComponent(id)}`,
      dto
    );
    return response.data;
  },
};
