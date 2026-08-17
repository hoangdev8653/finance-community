import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileView } from '@/components/profile/ProfileView';
import { usePublicProfile, useFollowers, useFollowing } from '@/lib/users/use-user-profile';
import { postsService } from '@/lib/posts/posts-service';
import { useAuth } from '@/lib/auth/AuthContext';
import { PublicProfile } from '@/types/users';

vi.mock('@/lib/users/use-user-profile', () => ({
  usePublicProfile: vi.fn(),
  useFollowers: vi.fn(),
  useFollowing: vi.fn(),
  useFollowUser: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUnfollowUser: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateProfile: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

vi.mock('@/lib/posts/posts-service', () => ({
  postsService: {
    getFeed: vi.fn(),
    getCategories: vi.fn().mockResolvedValue([]),
    getTags: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/lib/posts/use-posts-feed', () => ({
  useCategoryMap: () => ({}),
}));

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/portfolio_manager',
  useRouter: () => ({ push: vi.fn() }),
}));

describe('ProfileView Component', () => {
  let queryClient: QueryClient;

  const mockProfile: PublicProfile = {
    id: 'p-1',
    userId: 'u-1',
    username: 'portfolio_manager',
    displayName: 'Portfolio Manager',
    avatarMediaId: null,
    bio: 'Asset allocation.',
    createdAt: '2026-08-01T00:00:00Z',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });
    vi.mocked(usePublicProfile).mockReturnValue({
      data: mockProfile,
      isLoading: false,
      isError: false,
    } as any);
    vi.mocked(useFollowers).mockReturnValue({
      data: { data: [], meta: { totalItems: 5 } },
      isLoading: false,
      isError: false,
    } as any);
    vi.mocked(useFollowing).mockReturnValue({
      data: { data: [], meta: { totalItems: 3 } },
      isLoading: false,
      isError: false,
    } as any);
    vi.mocked(postsService.getFeed).mockResolvedValue({
      data: [],
      meta: { totalItems: 0 },
    } as any);
  });

  it('renders profile header, tab navigation, and default analyses tab', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileView initialProfile={mockProfile} />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Portfolio Manager/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Analyses/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Followers/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Following/i })).toBeDefined();

    // Switch to Followers tab
    const followersTab = screen.getByRole('tab', { name: /Followers/i });
    fireEvent.click(followersTab);

    expect(screen.getByText(/No followers yet/i)).toBeDefined();
  });
});
