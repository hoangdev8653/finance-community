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
  AdminOverviewEntity,
  PaginatedAdminUsersResponse,
} from '../../types/admin';
import { CategoryEntity } from '../../types/content';

export const adminService = {
  async getOverview(): Promise<AdminOverviewEntity> {
    const response = await apiClient.get<AdminOverviewEntity>('/admin/overview');
    return response.data;
  },
  async getPopularPosts(limit = 5) { return (await apiClient.get('/admin/analytics/popular-posts', { params: { limit } })).data; },
  async getPostCategoryStats() { return (await apiClient.get('/admin/analytics/posts-by-category')).data; },
  async getUsers(params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<PaginatedAdminUsersResponse> {
    const response = await apiClient.get<PaginatedAdminUsersResponse>('/admin/users', { params });
    return response.data;
  },
  /**
   * Public Feature Flags map for UI client directly from Backend API
   * GET /api/v1/feature-flags
   */
  async getPublicFeatureFlags(): Promise<Record<string, boolean>> {
    const response = await apiClient.get<Record<string, boolean>>('/feature-flags');
    return response.data;
  },

  /**
   * Change user account status (ACTIVE, SUSPENDED, BANNED, DEACTIVATED) directly on Backend API
   * PATCH /api/v1/admin/users/:id/status
   */
  async changeUserStatus(id: string, dto: UpdateUserStatusDto): Promise<any> {
    const response = await apiClient.patch(`/admin/users/${encodeURIComponent(id)}/status`, dto);
    return response.data;
  },

  /**
   * Assign RBAC role to target user directly on Backend API
   * POST /api/v1/admin/roles/assign
   */
  async assignRole(dto: AssignRoleDto): Promise<RoleActionResult> {
    const response = await apiClient.post<RoleActionResult>('/admin/roles/assign', dto);
    return response.data;
  },

  /**
   * Revoke RBAC role from target user directly on Backend API
   * POST /api/v1/admin/roles/revoke
   */
  async revokeRole(dto: AssignRoleDto): Promise<RoleActionResult> {
    const response = await apiClient.post<RoleActionResult>('/admin/roles/revoke', dto);
    return response.data;
  },

  /**
   * Get all runtime system settings directly from Backend API
   * GET /api/v1/admin/settings
   */
  async getSystemSettings(): Promise<SystemSettingEntity[]> {
    const response = await apiClient.get<SystemSettingEntity[]>('/admin/settings');
    return response.data;
  },

  /**
   * Upsert system configuration key-value setting directly on Backend API
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
   * Get full list of feature flags with descriptions for admin directly from Backend API
   * GET /api/v1/admin/feature-flags
   */
  async getAdminFeatureFlags(): Promise<FeatureFlagEntity[]> {
    const response = await apiClient.get<FeatureFlagEntity[]>('/admin/feature-flags');
    return response.data;
  },

  /**
   * Toggle feature flag state directly on Backend API
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
   * Query global security and governance audit logs directly from Backend API
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
   * Create new content category directly on Backend API
   * POST /api/v1/categories
   */
  async createCategory(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const response = await apiClient.post<CategoryEntity>('/categories', dto);
    return response.data;
  },

  /**
   * Update existing content category directly on Backend API
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

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${encodeURIComponent(id)}`);
  },
};
