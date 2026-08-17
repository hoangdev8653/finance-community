import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usersService } from '@/lib/users/users-service';
import { apiClient } from '@/lib/api/client';

describe('Users Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getPublicProfile() calls GET /profiles/:username', async () => {
    const mockProfile = {
      id: 'p-1',
      userId: 'u-1',
      username: 'quant_trader',
      displayName: 'Quant Trader',
      avatarMediaId: null,
      bio: 'Quantitative macro strategies.',
      createdAt: '2026-08-01T00:00:00Z',
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockProfile } as any);

    const result = await usersService.getPublicProfile('quant_trader');

    expect(getSpy).toHaveBeenCalledWith('/profiles/quant_trader');
    expect(result).toEqual(mockProfile);
  });

  it('getCurrentUserMe() calls GET /users/me', async () => {
    const mockMe = {
      id: 'u-1',
      email: 'quant@finance.com',
      status: 'ACTIVE' as const,
      roles: ['USER'],
      profile: {
        id: 'p-1',
        userId: 'u-1',
        username: 'quant_trader',
        displayName: 'Quant Trader',
        avatarMediaId: null,
        bio: 'Bio',
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z',
      },
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockMe } as any);

    const result = await usersService.getCurrentUserMe();

    expect(getSpy).toHaveBeenCalledWith('/users/me');
    expect(result).toEqual(mockMe);
  });

  it('updateProfile() calls PATCH /users/me/profile with DTO', async () => {
    const mockUpdated = {
      id: 'p-1',
      userId: 'u-1',
      username: 'quant_trader',
      displayName: 'Senior Quantitative Strategist',
      avatarMediaId: null,
      bio: 'Updated bio text.',
      createdAt: '2026-08-01T00:00:00Z',
    };

    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({ data: mockUpdated } as any);

    const result = await usersService.updateProfile({
      displayName: 'Senior Quantitative Strategist',
      bio: 'Updated bio text.',
    });

    expect(patchSpy).toHaveBeenCalledWith('/users/me/profile', {
      displayName: 'Senior Quantitative Strategist',
      bio: 'Updated bio text.',
    });
    expect(result).toEqual(mockUpdated);
  });

  it('followUser() calls POST /users/:id/follow', async () => {
    const mockResponse = { following: true, followingId: 'u-2' };
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await usersService.followUser('u-2');

    expect(postSpy).toHaveBeenCalledWith('/users/u-2/follow');
    expect(result).toEqual(mockResponse);
  });

  it('unfollowUser() calls DELETE /users/:id/follow', async () => {
    const mockResponse = { following: false, followingId: 'u-2' };
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await usersService.unfollowUser('u-2');

    expect(deleteSpy).toHaveBeenCalledWith('/users/u-2/follow');
    expect(result).toEqual(mockResponse);
  });

  it('getFollowers() calls GET /users/:id/followers with params', async () => {
    const mockFollowers = {
      data: [{ followerId: 'u-3', followedAt: '2026-08-15T00:00:00Z', profile: null }],
      meta: { page: 1, limit: 20, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockFollowers } as any);

    const result = await usersService.getFollowers('u-1', { page: 1, limit: 20 });

    expect(getSpy).toHaveBeenCalledWith('/users/u-1/followers', { params: { page: 1, limit: 20 } });
    expect(result).toEqual(mockFollowers);
  });

  it('getFollowing() calls GET /users/:id/following with params', async () => {
    const mockFollowing = {
      data: [{ followingId: 'u-4', followedAt: '2026-08-15T00:00:00Z', profile: null }],
      meta: { page: 1, limit: 20, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockFollowing } as any);

    const result = await usersService.getFollowing('u-1', { page: 1, limit: 20 });

    expect(getSpy).toHaveBeenCalledWith('/users/u-1/following', { params: { page: 1, limit: 20 } });
    expect(result).toEqual(mockFollowing);
  });
});
