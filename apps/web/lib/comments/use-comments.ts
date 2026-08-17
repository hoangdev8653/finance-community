'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from './comments-service';
import { queryKeys } from '../query/keys';
import { CreateCommentDto, UpdateCommentDto, QueryCommentsParams } from '../../types/comments';

export function usePostComments(postId: string, params?: QueryCommentsParams) {
  return useQuery({
    queryKey: queryKeys.posts.comments(postId, params as Record<string, unknown>),
    queryFn: () => commentsService.getPostComments(postId, params),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: Boolean(postId),
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCommentDto) => commentsService.createComment(postId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['posts', postId, 'comments'],
      });
    },
  });
}

export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, dto }: { commentId: string; dto: UpdateCommentDto }) =>
      commentsService.updateComment(commentId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['posts', postId, 'comments'],
      });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentsService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['posts', postId, 'comments'],
      });
    },
  });
}
