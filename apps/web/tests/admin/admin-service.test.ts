import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from '@/lib/admin/admin-service';
import { apiClient } from '@/lib/api/client';

describe('Admin Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getPublicFeatureFlags() calls GET /feature-flags', async () => {
    const mockFlags = { experimental_charts: true, beta_studio: false };
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockFlags,
    } as any);

    const result = await adminService.getPublicFeatureFlags();

    expect(getSpy).toHaveBeenCalledWith('/feature-flags');
    expect(result).toEqual(mockFlags);
  });

  it('changeUserStatus() calls PATCH /admin/users/:id/status with DTO', async () => {
    const dto = { status: 'SUSPENDED' as const, reason: 'Policy violation' };
    const mockUpdatedUser = { id: 'u-123', status: 'SUSPENDED' };

    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      data: mockUpdatedUser,
    } as any);

    const result = await adminService.changeUserStatus('u-123', dto);

    expect(patchSpy).toHaveBeenCalledWith('/admin/users/u-123/status', dto);
    expect(result).toEqual(mockUpdatedUser);
  });

  it('assignRole() and revokeRole() call POST /admin/roles/assign and revoke', async () => {
    const assignDto = { userId: 'u-123', roleName: 'MODERATOR' as const };
    const assignResponse = { assigned: true, roleName: 'MODERATOR', userId: 'u-123' };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: assignResponse,
    } as any);

    const assignResult = await adminService.assignRole(assignDto);
    expect(postSpy).toHaveBeenCalledWith('/admin/roles/assign', assignDto);
    expect(assignResult).toEqual(assignResponse);

    const revokeDto = { userId: 'u-123', roleName: 'MODERATOR' as const };
    const revokeResponse = { revoked: true, roleName: 'MODERATOR', userId: 'u-123' };

    postSpy.mockResolvedValueOnce({
      data: revokeResponse,
    } as any);

    const revokeResult = await adminService.revokeRole(revokeDto);
    expect(postSpy).toHaveBeenCalledWith('/admin/roles/revoke', revokeDto);
    expect(revokeResult).toEqual(revokeResponse);
  });

  it('getSystemSettings() and updateSystemSetting() handle GET and PATCH /admin/settings', async () => {
    const mockSettings = [
      { id: '1', key: 'max_upload_bytes', value: { max: 10485760 }, description: '10MB cap', updatedAt: '2026-08-16T00:00:00Z' },
    ];

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockSettings,
    } as any);

    const settings = await adminService.getSystemSettings();
    expect(getSpy).toHaveBeenCalledWith('/admin/settings');
    expect(settings).toEqual(mockSettings);

    const updateDto = { value: { max: 20971520 } };
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      data: { ...mockSettings[0], value: updateDto.value },
    } as any);

    const updated = await adminService.updateSystemSetting('max_upload_bytes', updateDto);
    expect(patchSpy).toHaveBeenCalledWith('/admin/settings/max_upload_bytes', updateDto);
    expect(updated.value).toEqual(updateDto.value);
  });

  it('getAdminFeatureFlags() and toggleFeatureFlag() handle GET and PATCH /admin/feature-flags', async () => {
    const mockFlags = [
      { id: '1', key: 'dark_mode', isEnabled: true, description: 'Dark theme', updatedAt: '2026-08-16T00:00:00Z' },
    ];

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockFlags,
    } as any);

    const flags = await adminService.getAdminFeatureFlags();
    expect(getSpy).toHaveBeenCalledWith('/admin/feature-flags');
    expect(flags).toEqual(mockFlags);

    const toggleDto = { isEnabled: false };
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      data: { ...mockFlags[0], isEnabled: false },
    } as any);

    const toggled = await adminService.toggleFeatureFlag('dark_mode', toggleDto);
    expect(patchSpy).toHaveBeenCalledWith('/admin/feature-flags/dark_mode', toggleDto);
    expect(toggled.isEnabled).toBe(false);
  });

  it('getAuditLogs() calls GET /admin/audit-logs with query params', async () => {
    const mockLogsResponse = {
      data: [{ id: '1', action: 'ROLE_ASSIGN', actor_id: 'u-1', entity_type: 'users', entity_id: 'u-2', metadata: null, ip_address: null, reason: null, created_at: '2026-08-16T00:00:00Z' }],
      meta: { page: 1, limit: 15, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockLogsResponse,
    } as any);

    const params = { page: 1, limit: 15, action: 'ROLE_ASSIGN' };
    const result = await adminService.getAuditLogs(params);

    expect(getSpy).toHaveBeenCalledWith('/admin/audit-logs', { params });
    expect(result).toEqual(mockLogsResponse);
  });

  it('createCategory() and updateCategory() handle POST and PATCH /categories', async () => {
    const createDto = { name: 'Macro Trends', slug: 'macro-trends', scope: 'COMMUNITY' as const };
    const mockCreated = { id: 'c-1', ...createDto, description: null, sortOrder: 0, createdAt: '2026-08-16T00:00:00Z', updatedAt: '2026-08-16T00:00:00Z' };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: mockCreated,
    } as any);

    const created = await adminService.createCategory(createDto);
    expect(postSpy).toHaveBeenCalledWith('/categories', createDto);
    expect(created).toEqual(mockCreated);

    const updateDto = { name: 'Global Macro Trends' };
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      data: { ...mockCreated, name: 'Global Macro Trends' },
    } as any);

    const updated = await adminService.updateCategory('c-1', updateDto);
    expect(patchSpy).toHaveBeenCalledWith('/categories/c-1', updateDto);
    expect(updated.name).toBe('Global Macro Trends');
  });
});
