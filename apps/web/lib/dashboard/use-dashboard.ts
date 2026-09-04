'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from './dashboard-service';
import { postsService } from '../posts/posts-service';
import { DashboardPostsParams } from '../../types/dashboard';
import { UpdatePostDto } from '../../types/content';

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  metrics: (authorId: string) => ['dashboard', 'metrics', authorId] as const,
  posts: (authorId: string, params?: DashboardPostsParams) =>
    ['dashboard', 'posts', { authorId, ...params }] as const,
};

/**
 * Hook to retrieve aggregated metrics for the current analyst.
 */
export function useDashboardMetrics(authorId?: string) {
  return useQuery({
    queryKey: authorId ? dashboardQueryKeys.metrics(authorId) : ['dashboard', 'metrics', 'none'],
    queryFn: () => (authorId ? dashboardService.getAuthorMetrics(authorId) : Promise.reject('No author ID')),
    enabled: Boolean(authorId),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to retrieve author's posts by status.
 */
export function useDashboardPosts(authorId?: string, params?: DashboardPostsParams) {
  return useQuery({
    queryKey: authorId ? dashboardQueryKeys.posts(authorId, params) : ['dashboard', 'posts', 'none'],
    queryFn: () => (authorId ? dashboardService.getAuthorPosts(authorId, params) : Promise.reject('No author ID')),
    enabled: Boolean(authorId),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to retrieve user's saved/bookmarked posts feed.
 */
export function useDashboardBookmarks(page = 1, limit = 10, enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'bookmarks', page, limit],
    queryFn: () => postsService.getMyBookmarks(page, limit),
    enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook for dashboard post lifecycle mutations (publish, archive, delete).
 */
export function useDashboardMutations() {
  const queryClient = useQueryClient();

  const invalidateDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['feed'] });
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ postId, status }: { postId: string; status: 'PUBLISHED' | 'ARCHIVED' | 'DRAFT' }) => {
      const dto: UpdatePostDto = { status };
      return postsService.updatePost(postId, dto);
    },
    onSuccess: invalidateDashboard,
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => postsService.deletePost(postId),
    onSuccess: invalidateDashboard,
  });

  return {
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    deletePost: deletePostMutation.mutateAsync,
    isDeletingPost: deletePostMutation.isPending,
  };
}
