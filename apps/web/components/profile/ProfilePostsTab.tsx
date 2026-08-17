'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsService } from '@/lib/posts/posts-service';
import { useCategoryMap } from '@/lib/posts/use-posts-feed';
import { PostCard } from '@/components/content/PostCard';
import { PostCardSkeleton } from '@/components/content/PostCardSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Button } from '@/components/ui/Button';
import { FileText } from 'lucide-react';

interface ProfilePostsTabProps {
  userId: string;
}

export function ProfilePostsTab({ userId }: ProfilePostsTabProps) {
  const [page, setPage] = useState(1);
  const categoryMap = useCategoryMap();

  const {
    data: postsResponse,
    isLoading,
    isError,
    refetch,
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
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load published analyses"
        message="Failed to retrieve research publications for this analyst."
        onRetry={() => refetch()}
      />
    );
  }

  const posts = postsResponse?.data || [];

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No published analyses yet"
        description="This analyst has not published any public research notes or educational series."
      />
    );
  }

  return (
    <div className="space-y-4 py-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          categoryName={post.categoryId ? categoryMap[post.categoryId]?.name : undefined}
        />
      ))}

      {postsResponse?.meta?.hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            className="font-mono text-xs"
          >
            Load More Analyses
          </Button>
        </div>
      )}
    </div>
  );
}
