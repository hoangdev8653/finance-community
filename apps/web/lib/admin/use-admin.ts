'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from './admin-service';
import { queryKeys } from '../query/keys';
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

export function usePublicFeatureFlags() {
  return useQuery<Record<string, boolean>>({
    queryKey: queryKeys.featureFlags.public,
    queryFn: () => adminService.getPublicFeatureFlags(),
    staleTime: 5 * 60 * 1000, // 5 mins
  });
}

export function useAdminFeatureFlags() {
  return useQuery<FeatureFlagEntity[]>({
    queryKey: queryKeys.featureFlags.admin,
    queryFn: () => adminService.getAdminFeatureFlags(),
    staleTime: 30 * 1000,
  });
}

export function useToggleFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation<
    FeatureFlagEntity,
    Error,
    { key: string; dto: ToggleFeatureFlagDto }
  >({
    mutationFn: ({ key, dto }) => adminService.toggleFeatureFlag(key, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.featureFlags.admin });
      queryClient.invalidateQueries({ queryKey: queryKeys.featureFlags.public });
      queryClient.invalidateQueries({ queryKey: ['admin', 'auditLogs'] });
    },
  });
}

export function useSystemSettings() {
  return useQuery<SystemSettingEntity[]>({
    queryKey: queryKeys.admin.settings,
    queryFn: () => adminService.getSystemSettings(),
    staleTime: 30 * 1000,
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();

  return useMutation<
    SystemSettingEntity,
    Error,
    { key: string; dto: UpdateSystemSettingDto }
  >({
    mutationFn: ({ key, dto }) => adminService.updateSystemSetting(key, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings });
      queryClient.invalidateQueries({ queryKey: ['admin', 'auditLogs'] });
    },
  });
}

export function useAuditLogs(params?: QueryAuditLogsParams) {
  return useQuery<PaginatedAuditLogsResponse>({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: () => adminService.getAuditLogs(params),
    staleTime: 15 * 1000,
  });
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; dto: UpdateUserStatusDto }>({
    mutationFn: ({ id, dto }) => adminService.changeUserStatus(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
      queryClient.invalidateQueries({ queryKey: ['admin', 'auditLogs'] });
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation<RoleActionResult, Error, AssignRoleDto>({
    mutationFn: (dto: AssignRoleDto) => adminService.assignRole(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
      queryClient.invalidateQueries({ queryKey: ['admin', 'auditLogs'] });
    },
  });
}

export function useRevokeRole() {
  const queryClient = useQueryClient();

  return useMutation<RoleActionResult, Error, AssignRoleDto>({
    mutationFn: (dto: AssignRoleDto) => adminService.revokeRole(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
      queryClient.invalidateQueries({ queryKey: ['admin', 'auditLogs'] });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation<CategoryEntity, Error, CreateCategoryDto>({
    mutationFn: (dto: CreateCategoryDto) => adminService.createCategory(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation<
    CategoryEntity,
    Error,
    { id: string; dto: UpdateCategoryDto }
  >({
    mutationFn: ({ id, dto }) => adminService.updateCategory(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
