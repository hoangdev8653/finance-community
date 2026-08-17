'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reactionsService } from './reactions-service';
import { queryKeys } from '../query/keys';
import {
  ReactionCountResponse,
  ToggleReactionResponse,
  ToggleReactionDto,
} from '../../types/reactions';

export function usePostReactions(postId: string) {
  return useQuery<ReactionCountResponse>({
    queryKey: queryKeys.reactions.post(postId),
    queryFn: () => reactionsService.getPostReactions(postId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: Boolean(postId),
  });
}

export function useCommentReactions(commentId: string) {
  return useQuery<ReactionCountResponse>({
    queryKey: queryKeys.reactions.comment(commentId),
    queryFn: () => reactionsService.getCommentReactions(commentId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: Boolean(commentId),
  });
}

export function useTogglePostReaction(postId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ToggleReactionResponse,
    Error,
    ToggleReactionDto | void,
    { previous?: ReactionCountResponse }
  >({
    mutationFn: (dto?: ToggleReactionDto | void) =>
      reactionsService.togglePostReaction(postId, dto || undefined),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.reactions.post(postId),
      });

      const previous = queryClient.getQueryData<ReactionCountResponse>(
        queryKeys.reactions.post(postId)
      );

      if (previous) {
        queryClient.setQueryData<ReactionCountResponse>(
          queryKeys.reactions.post(postId),
          {
            total: previous.userReacted
              ? Math.max(0, previous.total - 1)
              : previous.total + 1,
            userReacted: !previous.userReacted,
          }
        );
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.reactions.post(postId),
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reactions.post(postId),
      });
    },
  });
}

export function useToggleCommentReaction(commentId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ToggleReactionResponse,
    Error,
    ToggleReactionDto | void,
    { previous?: ReactionCountResponse }
  >({
    mutationFn: (dto?: ToggleReactionDto | void) =>
      reactionsService.toggleCommentReaction(commentId, dto || undefined),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.reactions.comment(commentId),
      });

      const previous = queryClient.getQueryData<ReactionCountResponse>(
        queryKeys.reactions.comment(commentId)
      );

      if (previous) {
        queryClient.setQueryData<ReactionCountResponse>(
          queryKeys.reactions.comment(commentId),
          {
            total: previous.userReacted
              ? Math.max(0, previous.total - 1)
              : previous.total + 1,
            userReacted: !previous.userReacted,
          }
        );
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.reactions.comment(commentId),
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reactions.comment(commentId),
      });
    },
  });
}
