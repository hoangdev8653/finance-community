import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { useAuth } from '@/lib/auth/AuthContext';
import { PublicProfile } from '@/types/users';

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/macro_analyst',
  useRouter: () => ({ push: vi.fn() }),
}));

describe('ProfileHeader Component', () => {
  let queryClient: QueryClient;

  const mockProfile: PublicProfile = {
    id: 'p-1',
    userId: 'u-12345678-abcd',
    username: 'macro_analyst',
    displayName: 'Chief Macro Strategist',
    avatarMediaId: null,
    bio: 'Covering global sovereign debt, central bank policies, and FX derivatives.',
    createdAt: '2026-08-01T00:00:00Z',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('renders display name, username, bio, joined date, and stats', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProfileHeader
          profile={mockProfile}
          followersCount={1250}
          followingCount={42}
          analysesCount={18}
        />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Chief Macro Strategist/i })).toBeDefined();
    expect(screen.getByText(/@macro_analyst/i)).toBeDefined();
    expect(screen.getByText(/Chuyên gia #u-123456/i)).toBeDefined();
    expect(screen.getByText(/Covering global sovereign debt/i)).toBeDefined();
    expect(screen.getByText('1250')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByText('18')).toBeDefined();
    expect(screen.getByText(/Thành viên từ/i)).toBeDefined();
  });

  it('renders "Edit Profile" button on own profile instead of follow button', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'u-12345678-abcd', // matching profile.userId
        email: 'macro@finance.com',
        username: 'macro_analyst',
        roles: ['USER'],
        status: 'ACTIVE',
      },
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProfileHeader
          profile={mockProfile}
          followersCount={1250}
          followingCount={42}
          analysesCount={18}
        />
      </QueryClientProvider>
    );

    expect(screen.getByRole('button', { name: /Chỉnh sửa hồ sơ/i })).toBeDefined();
    expect(screen.queryByRole('button', { name: /^Follow$/i })).toBeNull();
  });
});
