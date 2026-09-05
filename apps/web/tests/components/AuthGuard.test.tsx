import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import * as AuthModule from '@/lib/auth/AuthContext';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/protected/dashboard',
}));

describe('AuthGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when isLoading is true', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText(/Đang xác minh phiên đăng nhập/i)).toBeDefined();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('redirects unauthenticated users to /login?redirect=<path>', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fprotected%2Fdashboard');
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('renders children when user is authenticated and ACTIVE', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u-1',
        email: 'analyst@finance.com',
        username: 'analyst',
        roles: ['MEMBER'],
        status: 'ACTIVE',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Protected Content')).toBeDefined();
  });

  it('renders account restriction notice when user status is SUSPENDED', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u-1',
        email: 'analyst@finance.com',
        username: 'analyst',
        roles: ['MEMBER'],
        status: 'SUSPENDED',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText(/Account Suspended/i)).toBeDefined();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });
});
