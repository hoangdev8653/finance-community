import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserManagementView } from '@/components/admin/UserManagementView';
import * as authContext from '@/lib/auth/AuthContext';
import * as adminHooks from '@/lib/admin/use-admin';

vi.mock('@/lib/auth/AuthContext');
vi.mock('@/lib/admin/use-admin');

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
  });

  it('updates user status when target ID and status are submitted', async () => {
    mockChangeStatus.mockResolvedValueOnce({ id: 'target-user-1', status: 'SUSPENDED' });

    render(<UserManagementView />);

    const idInput = screen.getByLabelText(/Target User UUID/i);
    fireEvent.change(idInput, { target: { value: 'target-user-1' } });

    const statusSelect = screen.getByLabelText(/Set New Status/i);
    fireEvent.change(statusSelect, { target: { value: 'SUSPENDED' } });

    const updateBtn = screen.getByRole('button', { name: /Update Account Status/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(mockChangeStatus).toHaveBeenCalledWith({
        id: 'target-user-1',
        dto: { status: 'SUSPENDED', reason: undefined },
      });
      expect(screen.getByText(/User status successfully updated to 'SUSPENDED'/i)).toBeDefined();
    });
  });

  it('enforces destructive confirmation checkbox for BANNED status', async () => {
    render(<UserManagementView />);

    const idInput = screen.getByLabelText(/Target User UUID/i);
    fireEvent.change(idInput, { target: { value: 'target-user-2' } });

    const statusSelect = screen.getByLabelText(/Set New Status/i);
    fireEvent.change(statusSelect, { target: { value: 'BANNED' } });

    const updateBtn = screen.getByRole('button', { name: /Update Account Status/i });
    fireEvent.click(updateBtn);

    expect(screen.getByText(/Please confirm the destructive status change checkbox/i)).toBeDefined();
    expect(mockChangeStatus).not.toHaveBeenCalled();

    const checkbox = screen.getByLabelText(/Confirm destructive status penalty/i);
    fireEvent.click(checkbox);

    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(mockChangeStatus).toHaveBeenCalledWith({
        id: 'target-user-2',
        dto: { status: 'BANNED', reason: undefined },
      });
    });
  });

  it('assigns and revokes RBAC roles', async () => {
    mockAssignRole.mockResolvedValueOnce({ assigned: true });
    mockRevokeRole.mockResolvedValueOnce({ revoked: true });

    render(<UserManagementView />);

    const idInput = screen.getByLabelText(/Target User UUID/i);
    fireEvent.change(idInput, { target: { value: 'target-user-3' } });

    const roleSelect = screen.getByLabelText(/Select Role/i);
    fireEvent.change(roleSelect, { target: { value: 'MODERATOR' } });

    const assignBtn = screen.getByRole('button', { name: /Assign Role/i });
    fireEvent.click(assignBtn);

    await waitFor(() => {
      expect(mockAssignRole).toHaveBeenCalledWith({
        userId: 'target-user-3',
        roleName: 'MODERATOR',
      });
    });

    const revokeBtn = screen.getByRole('button', { name: /Revoke Role/i });
    fireEvent.click(revokeBtn);

    await waitFor(() => {
      expect(mockRevokeRole).toHaveBeenCalledWith({
        userId: 'target-user-3',
        roleName: 'MODERATOR',
      });
    });
  });
});
