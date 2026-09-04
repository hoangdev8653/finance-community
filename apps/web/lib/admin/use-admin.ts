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
  PaginatedAdminUsersResponse,
  QueryAdminCommentsParams,
  PaginatedAdminCommentsResponse,
  UpdateCommentStatusDto,
  AdminCommentEntity,
  CreateTagDto,
  UpdateTagDto,
} from '../../types/admin';
import { CategoryEntity, TagEntity } from '../../types/content';

export function usePublicFeatureFlags() {
  return useQuery<Record<string, boolean>>({
    queryKey: queryKeys.featureFlags.public,
    queryFn: () => adminService.getPublicFeatureFlags(),
    staleTime: 5 * 60 * 1000, // 5 mins
  });
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => adminService.getOverview(),
    staleTime: 30 * 1000,
  });
}

export function useAdminUsers(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: ['admin', 'users', params ?? {}],
    queryFn: () => adminService.getUsers(params),
    staleTime: 30 * 1000,
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
    onSuccess: (_data, variables) => {
      queryClient.setQueriesData<PaginatedAdminUsersResponse>(
        { queryKey: ['admin', 'users'] },
        (current) => current
          ? {
              ...current,
              data: current.data.map((item) =>
                item.id === variables.id
                  ? { ...item, status: variables.dto.status }
                  : item,
              ),
            }
          : current,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
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

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => adminService.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}

export function useAdminComments(params?: QueryAdminCommentsParams) {
  return useQuery<PaginatedAdminCommentsResponse>({
    queryKey: queryKeys.admin.comments(params as Record<string, unknown>),
    queryFn: () => adminService.getComments(params),
    staleTime: 15 * 1000,
  });
}

export function useUpdateCommentStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    AdminCommentEntity,
    Error,
    { id: string; dto: UpdateCommentStatusDto }
  >({
    mutationFn: ({ id, dto }) => adminService.updateCommentStatus(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'auditLogs'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useAdminTags(params?: { search?: string; limit?: number }) {
  return useQuery<TagEntity[]>({
    queryKey: queryKeys.tags.list(params?.search, params?.limit),
    queryFn: () => adminService.getTags(params),
    staleTime: 30 * 1000,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation<TagEntity, Error, CreateTagDto>({
    mutationFn: (dto: CreateTagDto) => adminService.createTag(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation<TagEntity, Error, { id: string; dto: UpdateTagDto }>({
    mutationFn: ({ id, dto }) => adminService.updateTag(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => adminService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

