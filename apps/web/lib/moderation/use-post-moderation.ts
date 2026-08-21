'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moderationService } from './moderation-service';
import { PaginatedModerationPostsResponse, ModerationPostItem } from '../../types/moderation';

export function useModerationPosts(params?: {
  moderationStatus?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<PaginatedModerationPostsResponse>({
    queryKey: ['moderation-posts', params],
    queryFn: () => moderationService.getModerationPosts(params),
    staleTime: 15 * 1000,
  });
}

export function useApprovePost() {
  const queryClient = useQueryClient();

  return useMutation<ModerationPostItem, Error, string>({
    mutationFn: (id: string) => moderationService.approvePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useBanPost() {
  const queryClient = useQueryClient();

  return useMutation<ModerationPostItem, Error, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) => moderationService.banPost(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
