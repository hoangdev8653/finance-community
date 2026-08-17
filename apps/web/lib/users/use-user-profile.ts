'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from './users-service';
import { queryKeys } from '../query/keys';
import {
  PublicProfile,
  UpdateProfileDto,
  QueryFollowsParams,
} from '../../types/users';

export function usePublicProfile(username: string, initialData?: PublicProfile) {
  return useQuery({
    queryKey: queryKeys.users.profile(username),
    queryFn: () => usersService.getPublicProfile(username),
    initialData,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: Boolean(username),
  });
}

export function useCurrentUserMe() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => usersService.getCurrentUserMe(),
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useFollowers(userId: string, params?: QueryFollowsParams) {
  return useQuery({
    queryKey: [...queryKeys.users.followers(userId), params],
    queryFn: () => usersService.getFollowers(userId, params),
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: Boolean(userId),
  });
}

export function useFollowing(userId: string, params?: QueryFollowsParams) {
  return useQuery({
    queryKey: [...queryKeys.users.following(userId), params],
    queryFn: () => usersService.getFollowing(userId, params),
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: Boolean(userId),
  });
}

export function useFollowUser(targetUserId: string, currentUserId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersService.followUser(targetUserId),
    onSuccess: () => {
      // Invalidate target user's followers list & counts
      queryClient.invalidateQueries({
        queryKey: ['users', targetUserId, 'followers'],
      });
      // Invalidate current user's following list & counts
      if (currentUserId) {
        queryClient.invalidateQueries({
          queryKey: ['users', currentUserId, 'following'],
        });
      }
    },
  });
}

export function useUnfollowUser(targetUserId: string, currentUserId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersService.unfollowUser(targetUserId),
    onSuccess: () => {
      // Invalidate target user's followers list & counts
      queryClient.invalidateQueries({
        queryKey: ['users', targetUserId, 'followers'],
      });
      // Invalidate current user's following list & counts
      if (currentUserId) {
        queryClient.invalidateQueries({
          queryKey: ['users', currentUserId, 'following'],
        });
      }
    },
  });
}

export function useUpdateProfile(username?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => usersService.updateProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
      if (username) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.profile(username),
        });
      }
    },
  });
}
