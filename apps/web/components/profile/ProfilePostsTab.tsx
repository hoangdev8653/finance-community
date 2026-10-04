'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { postsService } from '@/lib/posts/posts-service';
import { useCategoryMap } from '@/lib/posts/use-posts-feed';
import { PostCard } from '@/components/content/PostCard';
import { PostCardSkeleton } from '@/components/content/PostCardSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/AuthContext';
import { FileText, Loader2 } from 'lucide-react';

interface ProfilePostsTabProps {
  userId: string;
}

export function ProfilePostsTab({ userId }: ProfilePostsTabProps) {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const { user } = useAuth();
  const categoryMap = useCategoryMap();
  const isSelf = Boolean(user && user.id === userId);

  const {
    data: postsResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['posts', 'list', { authorId: userId, status: 'PUBLISHED', page, limit: 10 }],
    queryFn: () =>
      postsService.getFeed({
        authorId: userId,
        status: 'PUBLISHED',
        page,
        limit: 10,
        sortBy: 'publishedAt',
        order: 'DESC',
      }),
    staleTime: 60 * 1000,
    enabled: Boolean(userId),
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Không thể tải danh sách bài viết"
        message="Đã có lỗi xảy ra khi tải các bài viết của người dùng này. Vui lòng thử lại sau."
        onRetry={() => refetch()}
      />
    );
  }

  const posts = postsResponse?.data || [];

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Chưa có bài viết xuất bản"
        description="Tác giả chưa xuất bản bài phân tích hoặc ghi chú nghiên cứu nào trên hệ thống."
        actionLabel={isSelf ? 'Soạn bài viết mới' : undefined}
        onAction={isSelf ? () => router.push('/bai-viet/tao-moi') : undefined}
        className="my-4 min-h-[260px] py-12"
      />
    );
  }

  return (
    <div className="w-full space-y-4 py-2">
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            categoryName={post.categoryId ? categoryMap[post.categoryId]?.name : undefined}
          />
        ))}
      </div>

      {postsResponse?.meta?.hasNextPage && (
        <div className="flex justify-center pt-6 pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={isFetching}
            className="h-10 gap-2 rounded-[8px] border-border px-5 text-sm font-semibold transition-all hover:bg-muted"
          >
            {isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            <span>Tải thêm bài viết</span>
          </Button>
        </div>
      )}
    </div>
  );
}
