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

export const usersService = {
  /**
   * Get public analyst profile by username directly from Backend API
   * GET /api/v1/profiles/:username
   */
  async getPublicProfile(username: string): Promise<PublicProfile> {
    const response = await apiClient.get<PublicProfile>(
      `/profiles/${encodeURIComponent(username)}`
    );
    return response.data;
  },

  /**
   * Get authenticated user record with roles and profile details directly from Backend API
   * GET /api/v1/users/me
   */
  async getCurrentUserMe(): Promise<UserMeResponse> {
    const response = await apiClient.get<UserMeResponse>('/users/me');
    return response.data;
  },

  /**
   * Update authenticated user's profile details directly on Backend API
   * PATCH /api/v1/users/me/profile
   */
  async updateProfile(dto: UpdateProfileDto): Promise<PublicProfile> {
    const response = await apiClient.patch<PublicProfile>('/users/me/profile', dto);
    return response.data;
  },

  /**
   * Follow a user idempotently directly on Backend API
   * POST /api/v1/users/:id/follow
   */
  async followUser(userId: string): Promise<FollowStatusResponse> {
    const response = await apiClient.post<FollowStatusResponse>(
      `/users/${encodeURIComponent(userId)}/follow`
    );
    return response.data;
  },

  /**
   * Unfollow a user idempotently directly on Backend API
   * DELETE /api/v1/users/:id/follow
   */
  async unfollowUser(userId: string): Promise<FollowStatusResponse> {
    const response = await apiClient.delete<FollowStatusResponse>(
      `/users/${encodeURIComponent(userId)}/follow`
    );
    return response.data;
  },

  /**
   * Get paginated followers of a user directly from Backend API
   * GET /api/v1/users/:id/followers
   */
  async getFollowers(
    userId: string,
    params?: QueryFollowsParams
  ): Promise<PaginatedResult<FollowerItem>> {
    const response = await apiClient.get<PaginatedResult<FollowerItem>>(
      `/users/${encodeURIComponent(userId)}/followers`,
      { params }
    );
    return response.data;
  },

  /**
   * Get paginated following list of a user directly from Backend API
   * GET /api/v1/users/:id/following
   */
  async getFollowing(
    userId: string,
    params?: QueryFollowsParams
  ): Promise<PaginatedResult<FollowingItem>> {
    const response = await apiClient.get<PaginatedResult<FollowingItem>>(
      `/users/${encodeURIComponent(userId)}/following`,
      { params }
    );
    return response.data;
  },
};

