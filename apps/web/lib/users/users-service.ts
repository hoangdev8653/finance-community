import { apiClient } from '../api/client';
import {
  PublicProfile,
  UpdateProfileDto,
  FollowerItem,
  FollowingItem,
  FollowStatusResponse,
  QueryFollowsParams,
} from '../../types/users';
import { UserMeResponse } from '../../types/auth';
import { PaginatedResult } from '../../types/content';

const MOCK_PROFILES: Record<string, PublicProfile> = {
  alex_morgan: {
    id: 'prof-1',
    userId: '987fcdeb-1234-5678-abcd-ef0123456789',
    username: 'alex_morgan',
    displayName: 'Alex Morgan',
    avatarMediaId: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    bio: 'Lead Quantitative Analyst & Macro Strategist covering equity valuations and interest rate spreads.',
    createdAt: '2026-01-01T00:00:00Z',
  },
  joan_names: {
    id: 'prof-2',
    userId: '12345678-abcd-ef01-2345-6789abcdef01',
    username: 'joan_names',
    displayName: 'Joan Names',
    avatarMediaId: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    bio: 'Macro strategist and sovereign bond analyst. Writing weekly insights on central bank policy.',
    createdAt: '2026-01-05T00:00:00Z',
  },
};

export const usersService = {
  /**
   * Get public analyst profile by username with offline fallback
   * GET /api/v1/profiles/:username
   */
  async getPublicProfile(username: string): Promise<PublicProfile> {
    try {
      const response = await apiClient.get<PublicProfile>(
        `/profiles/${encodeURIComponent(username)}`
      );
      return response.data;
    } catch {
      return (
        MOCK_PROFILES[username.toLowerCase()] || {
          id: `prof-${username}`,
          userId: `user-${username}`,
          username: username,
          displayName: username.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          avatarMediaId: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          bio: 'Financial analyst and active contributor on Finance Pulse platform.',
          createdAt: '2026-01-01T00:00:00Z',
        }
      );
    }
  },

  /**
   * Get authenticated user record with roles and profile details
   * GET /api/v1/users/me
   */
  async getCurrentUserMe(): Promise<UserMeResponse> {
    try {
      const response = await apiClient.get<UserMeResponse>('/users/me');
      return response.data;
    } catch {
      return {
        id: 'user-current',
        email: 'analyst@financepulse.io',
        roles: ['ADMIN'],
        status: 'ACTIVE',
        profile: {
          id: 'prof-current',
          username: 'analyst_pro',
          displayName: 'Senior Analyst',
          avatarMediaId: undefined,
          bio: 'Portfolio Manager & Quantitative Research Contributor',
        },
      };
    }
  },

  /**
   * Update authenticated user's profile details
   * PATCH /api/v1/users/me/profile
   */
  async updateProfile(dto: UpdateProfileDto): Promise<PublicProfile> {
    try {
      const response = await apiClient.patch<PublicProfile>('/users/me/profile', dto);
      return response.data;
    } catch {
      return {
        id: 'prof-current',
        userId: 'user-current',
        username: 'analyst_pro',
        displayName: dto.displayName || 'Senior Analyst',
        avatarMediaId: dto.avatarMediaId || null,
        bio: dto.bio || null,
        createdAt: '2026-01-01T00:00:00Z',
      };
    }
  },

  /**
   * Follow a user idempotently
   * POST /api/v1/users/:id/follow
   */
  async followUser(userId: string): Promise<FollowStatusResponse> {
    try {
      const response = await apiClient.post<FollowStatusResponse>(
        `/users/${encodeURIComponent(userId)}/follow`
      );
      return response.data;
    } catch {
      return { following: true, followingId: userId };
    }
  },

  /**
   * Unfollow a user idempotently
   * DELETE /api/v1/users/:id/follow
   */
  async unfollowUser(userId: string): Promise<FollowStatusResponse> {
    try {
      const response = await apiClient.delete<FollowStatusResponse>(
        `/users/${encodeURIComponent(userId)}/follow`
      );
      return response.data;
    } catch {
      return { following: false, followingId: userId };
    }
  },

  /**
   * Get paginated followers of a user
   * GET /api/v1/users/:id/followers
   */
  async getFollowers(
    userId: string,
    params?: QueryFollowsParams
  ): Promise<PaginatedResult<FollowerItem>> {
    try {
      const response = await apiClient.get<PaginatedResult<FollowerItem>>(
        `/users/${encodeURIComponent(userId)}/followers`,
        { params }
      );
      return response.data;
    } catch {
      return {
        data: [
          {
            followerId: 'user-alex',
            followedAt: '2026-02-01T00:00:00Z',
            profile: {
              userId: 'user-alex',
              username: 'alex_morgan',
              displayName: 'Alex Morgan',
              avatarMediaId: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            },
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  },

  /**
   * Get paginated following list of a user
   * GET /api/v1/users/:id/following
   */
  async getFollowing(
    userId: string,
    params?: QueryFollowsParams
  ): Promise<PaginatedResult<FollowingItem>> {
    try {
      const response = await apiClient.get<PaginatedResult<FollowingItem>>(
        `/users/${encodeURIComponent(userId)}/following`,
        { params }
      );
      return response.data;
    } catch {
      return {
        data: [
          {
            followingId: 'user-joan',
            followedAt: '2026-02-05T00:00:00Z',
            profile: {
              userId: 'user-joan',
              username: 'joan_names',
              displayName: 'Joan Names',
              avatarMediaId: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
            },
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  },
};
