import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import * as authContext from '@/lib/auth/AuthContext';

vi.mock('@/lib/auth/AuthContext');

describe('AdminGuard Component', () => {
  it('renders children when user has ADMIN role', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u-1', roles: ['ADMIN'] },
    } as any);

    render(
      <AdminGuard>
        <div>Admin Dashboard Content</div>
      </AdminGuard>
    );

    expect(screen.getByText('Admin Dashboard Content')).toBeDefined();
  });

  it('renders children when user has SUPER_ADMIN role', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u-1', roles: ['SUPER_ADMIN'] },
    } as any);

    render(
      <AdminGuard>
        <div>Admin Dashboard Content</div>
      </AdminGuard>
    );

    expect(screen.getByText('Admin Dashboard Content')).toBeDefined();
  });

  it('blocks MEMBER or MODERATOR users and renders Access Required warning', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u-2', roles: ['MODERATOR'] },
    } as any);

    render(
      <AdminGuard>
        <div>Admin Dashboard Content</div>
      </AdminGuard>
    );

    expect(screen.getByText(/Administrative Access Required/i)).toBeDefined();
    expect(screen.queryByText('Admin Dashboard Content')).toBeNull();
  });

  it('renders loading state when auth is loading', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    } as any);

    render(
      <AdminGuard>
        <div>Admin Dashboard Content</div>
      </AdminGuard>
    );

    expect(screen.getByText(/Verifying administrative credentials/i)).toBeDefined();
  });
});
