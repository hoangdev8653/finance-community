'use client';

import React from 'react';
import { usePostsFeed, useCategoryMap } from '@/lib/posts/use-posts-feed';
import { PostEntity } from '@/types/content';
import { PostCard } from './PostCard';
import { PostCardSkeleton } from './PostCardSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';

interface FeedListProps {
  contentType?: 'SERIES' | 'COMMUNITY' | 'NEWS';
  categoryId?: string;
  tagId?: string;
  topicId?: string;
  sortBy?: 'publishedAt' | 'createdAt';
  onResetFilters: () => void;
}

export function FeedList({
  contentType,
  categoryId,
  tagId,
  topicId,
  sortBy = 'publishedAt',
  onResetFilters,
}: FeedListProps) {
  const categoryMap = useCategoryMap();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostsFeed({
    contentType,
    categoryId,
    tagId,
    topicId,
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

  const allPosts = data?.pages.flatMap((page) => page.data) || [];

  if (allPosts.length === 0 || isError) {
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
            className="w-full sm:w-auto min-w-[200px] border-border text-foreground font-medium hover:bg-muted cursor-pointer"
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
