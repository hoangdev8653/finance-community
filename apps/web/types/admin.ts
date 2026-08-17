export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DEACTIVATED';

export type RoleName = 'MEMBER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface UpdateUserStatusDto {
  status: UserStatus;
  reason?: string;
}

export interface AssignRoleDto {
  userId: string;
  roleName: RoleName;
}

export interface RoleActionResult {
  assigned?: boolean;
  revoked?: boolean;
  roleName: string;
  userId: string;
}

export interface SystemSettingEntity {
  id: string;
  key: string;
  value: Record<string, any>;
  description: string | null;
  updatedAt: string;
}

export interface UpdateSystemSettingDto {
  value: Record<string, any>;
  description?: string;
}

export interface FeatureFlagEntity {
  id: string;
  key: string;
  isEnabled: boolean;
  description: string | null;
  updatedAt: string;
}

export interface ToggleFeatureFlagDto {
  isEnabled: boolean;
  description?: string;
}

export interface AuditLogEntity {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  reason: string | null;
  created_at: string;
}

export interface QueryAuditLogsParams {
  page?: number;
  limit?: number;
  actorId?: string;
  entityType?: string;
  action?: string;
}

export interface PaginatedAuditLogsResponse {
  data: AuditLogEntity[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  scope: 'SERIES' | 'COMMUNITY';
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
}
