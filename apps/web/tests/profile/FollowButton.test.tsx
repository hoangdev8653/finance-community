import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FollowButton } from '@/components/profile/FollowButton';
import { useAuth } from '@/lib/auth/AuthContext';
import { useFollowUser, useUnfollowUser } from '@/lib/users/use-user-profile';

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/users/use-user-profile', () => ({
  useFollowUser: vi.fn(),
  useUnfollowUser: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/target_user',
  useRouter: () => ({ push: mockPush }),
}));

describe('FollowButton Component', () => {
  beforeEach(() => {
    vi.mocked(useFollowUser).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ following: true, followingId: 'target-1' }),
      isPending: false,
    } as any);
    vi.mocked(useUnfollowUser).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ following: false, followingId: 'target-1' }),
      isPending: false,
    } as any);
  });

  it('renders null when targetUserId matches logged in user (no self-follow)', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'target-1', email: 'me@test.com', username: 'me', roles: ['USER'], status: 'ACTIVE' },
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    const { container } = render(
      <FollowButton targetUserId="target-1" targetUsername="target_user" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('redirects to /login if clicked when unauthenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    render(<FollowButton targetUserId="target-1" targetUsername="target_user" />);

    const followBtn = screen.getByRole('button', { name: /Follow/i });
    fireEvent.click(followBtn);

    expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fprofile%2Ftarget_user');
  });

  it('toggles between Follow and Following on click', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-1', email: 'me@test.com', username: 'me', roles: ['USER'], status: 'ACTIVE' },
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    render(<FollowButton targetUserId="target-1" targetUsername="target_user" />);

    const followBtn = screen.getByRole('button', { name: /Follow/i });
    fireEvent.click(followBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Following/i })).toBeDefined();
    });
  });
});
