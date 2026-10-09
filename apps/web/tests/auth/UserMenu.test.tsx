import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserMenu } from '@/components/auth/UserMenu';
import * as AuthContextModule from '@/lib/auth/AuthContext';

describe('UserMenu Component', () => {
  it('renders trigger button with enlarged avatar and no outer hover border', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u-1',
        email: 'hoang@example.com',
        username: 'hoangdev',
        displayName: 'Hoàng Dev',
        avatarUrl: 'https://example.com/avatar.jpg',
        roles: ['USER'],
        status: 'ACTIVE',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
      loginWithFacebook: vi.fn(),
    });

    render(<UserMenu />);

    const triggerBtn = screen.getByRole('button', { name: /Mở menu tài khoản/i });
    expect(triggerBtn).toBeInTheDocument();
    // Verify outer border and hover border ring are removed
    expect(triggerBtn.className).not.toContain('hover:border-primary');
    expect(triggerBtn.className).not.toContain('hover:bg-primary');
    expect(triggerBtn.className).toContain('rounded-full');
    expect(triggerBtn.className).toContain('h-10');
    expect(triggerBtn.className).toContain('w-10');
  });
});
