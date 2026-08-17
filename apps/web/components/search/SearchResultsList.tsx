'use client';

import React from 'react';
import { useSearchDiscovery } from '@/lib/search/use-search';
import { useCategoryMap } from '@/lib/posts/use-posts-feed';
import { SearchFilterState } from '@/types/search';
import { PostEntity } from '@/types/content';
import { PostCard } from '@/components/content/PostCard';
import { PostCardSkeleton } from '@/components/content/PostCardSkeleton';
import { Button } from '@/components/ui/Button';
import { SearchX, ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchResultsListProps {
  filters: SearchFilterState;
  onPageChange: (page: number) => void;
}

export function SearchResultsList({ filters, onPageChange }: SearchResultsListProps) {
  const { data, isLoading, isError, refetch } = useSearchDiscovery(filters);
  const categoryMap = useCategoryMap();

  const posts = data?.data || [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-danger/20 bg-danger/5 p-8 text-center space-y-3"
      >
        <p className="text-sm font-semibold text-foreground">
          Failed to load discovery results.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
        <SearchX className="h-10 w-10 text-muted-foreground mx-auto" />
        <div className="space-y-1">
          <h3 className="text-sm font-serif font-bold text-foreground">
            No Matching Financial Articles
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try broadening your search criteria or selecting a different category or topic tag.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Results Summary */}
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
        <span>
          Showing {posts.length} {meta ? `of ${meta.totalItems}` : ''} publications
        </span>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {posts.map((post: PostEntity) => (
          <PostCard
            key={post.id}
            post={post}
            categoryName={
              post.categoryId ? categoryMap[post.categoryId]?.name : undefined
            }
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4 text-xs font-mono text-muted-foreground">
          <div>
            Page {meta.page} of {meta.totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, (filters.page || 1) - 1))}
              disabled={!meta.hasPreviousPage}
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((filters.page || 1) + 1)}
              disabled={!meta.hasNextPage}
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
