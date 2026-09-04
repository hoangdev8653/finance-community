'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsService } from './posts-service';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../toast/ToastContext';

export function usePostBookmark(postId: string) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey = ['posts', 'bookmark', postId] as const;

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => postsService.getBookmarkStatus(postId),
    enabled: Boolean(isAuthenticated && postId),
    staleTime: 60 * 1000,
  });

  const isBookmarked = Boolean(data?.bookmarked);

  const toggleMutation = useMutation({
    mutationFn: () => postsService.toggleBookmark(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<{ bookmarked: boolean }>(queryKey);

      queryClient.setQueryData(queryKey, {
        bookmarked: !isBookmarked,
      });

      return { previous };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(err?.response?.data?.message || 'Không thể lưu bài viết. Vui lòng thử lại.');
    },
    onSuccess: (result) => {
      queryClient.setQueryData(queryKey, result);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'bookmarks'] });
      if (result.bookmarked) {
        toast.success('Đã lưu bài viết vào danh sách đánh dấu.');
      } else {
        toast.info('Đã bỏ lưu bài viết.');
      }
    },
  });

  const toggleBookmark = () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để lưu bài viết.');
      return;
    }
    toggleMutation.mutate();
  };

  return {
    isBookmarked,
    isLoading: isLoading || toggleMutation.isPending,
    toggleBookmark,
  };
}
