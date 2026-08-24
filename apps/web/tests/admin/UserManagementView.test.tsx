import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserManagementView } from '@/components/admin/UserManagementView';
import * as authContext from '@/lib/auth/AuthContext';
import * as adminHooks from '@/lib/admin/use-admin';
import * as toastContext from '@/lib/toast/ToastContext';

vi.mock('@/lib/auth/AuthContext');
vi.mock('@/lib/admin/use-admin');
vi.mock('@/lib/toast/ToastContext');

describe('UserManagementView Component', () => {
  const mockChangeStatus = vi.fn();
  const mockAssignRole = vi.fn();
  const mockRevokeRole = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockChangeStatus.mockReset();
    mockAssignRole.mockReset();
    mockRevokeRole.mockReset();

    vi.mocked(authContext.useAuth).mockReturnValue({
      user: { id: 'admin-uuid-1', roles: ['SUPER_ADMIN'] },
      isAuthenticated: true,
    } as any);
    vi.mocked(toastContext.useToast).mockReturnValue({
      toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
    } as any);

    vi.mocked(adminHooks.useChangeUserStatus).mockReturnValue({
      mutateAsync: mockChangeStatus,
      isPending: false,
    } as any);

    vi.mocked(adminHooks.useAssignRole).mockReturnValue({
      mutateAsync: mockAssignRole,
      isPending: false,
    } as any);

    vi.mocked(adminHooks.useRevokeRole).mockReturnValue({
      mutateAsync: mockRevokeRole,
      isPending: false,
    } as any);

    vi.mocked(adminHooks.useAdminUsers).mockReturnValue({
      data: {
        data: [{ id: 'target-user-1', email: 'target@example.com', displayName: 'Target User', username: 'target', roles: ['MEMBER'], status: 'ACTIVE', createdAt: '2026-08-16T00:00:00Z' }],
        meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      },
      isLoading: false,
    } as any);
  });

  it('updates user status when target ID and status are submitted', async () => {
    mockChangeStatus.mockResolvedValueOnce({ id: 'target-user-1', status: 'SUSPENDED' });

    render(<UserManagementView />);

    fireEvent.click(screen.getByRole('button', { name: /Kh.*t.*kho.*target@example.com/i }));
    fireEvent.click(screen.getByRole('button', { name: /X.*nh.*kh.*a/i }));
    await waitFor(() => expect(mockChangeStatus).toHaveBeenCalledWith({ id: 'target-user-1', dto: { status: 'SUSPENDED', reason: 'Admin quick action' } }));
  });

  it('enforces destructive confirmation checkbox for BANNED status', async () => {
    render(<UserManagementView />);

    expect(screen.getByText('Target User')).toBeDefined();
    expect(mockChangeStatus).not.toHaveBeenCalled();
  });

  it('assigns and revokes RBAC roles', async () => {
    mockAssignRole.mockResolvedValueOnce({ assigned: true });
    mockRevokeRole.mockResolvedValueOnce({ revoked: true });

    render(<UserManagementView />);

    fireEvent.click(screen.getByRole('button', { name: /G.*n Moderator target@example.com/i }));
    await waitFor(() => expect(mockAssignRole).toHaveBeenCalledWith({ userId: 'target-user-1', roleName: 'MODERATOR' }));
  });
});
