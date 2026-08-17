'use client';

import React from 'react';
import { usePostsFeed, useCategoryMap } from '@/lib/posts/use-posts-feed';
import { PostEntity } from '@/types/content';
import { PostCard } from './PostCard';
import { PostCardSkeleton } from './PostCardSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Button } from '@/components/ui/Button';

interface FeedListProps {
  contentType?: 'SERIES' | 'COMMUNITY';
  categoryId?: string;
  tagId?: string;
  sortBy?: 'publishedAt' | 'createdAt';
  onResetFilters: () => void;
}

export function FeedList({
  contentType,
  categoryId,
  tagId,
  sortBy = 'publishedAt',
  onResetFilters,
}: FeedListProps) {
  const categoryMap = useCategoryMap();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = usePostsFeed({
    contentType,
    categoryId,
    tagId,
    sortBy,
    order: 'DESC',
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load feed"
        message={
          (error as any)?.message ||
          'Failed to retrieve articles. Please check your connection and try again.'
        }
        onRetry={() => refetch()}
      />
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.data) || [];

  if (allPosts.length === 0) {
    return (
      <EmptyState
        title="No published analyses found"
        description="There are no published articles matching the current topic or category filters."
        actionLabel="Reset Filters"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Posts Stream */}
      <div className="space-y-4">
        {allPosts.map((post: PostEntity) => (
          <PostCard
            key={post.id}
            post={post}
            categoryName={post.categoryId ? categoryMap[post.categoryId]?.name : undefined}
          />
        ))}
      </div>

      {/* Infinite Pagination Trigger */}
      {hasNextPage && (
        <div className="pt-4 flex justify-center">
          <Button
            variant="outline"
            className="w-full sm:w-auto min-w-[200px] border-border text-foreground font-medium hover:bg-muted"
            onClick={() => fetchNextPage()}
            isLoading={isFetchingNextPage}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load More Articles'}
          </Button>
        </div>
      )}
    </div>
  );
}
