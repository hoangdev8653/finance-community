'use client';

import React from 'react';
import Link from 'next/link';
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
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; href: string };
}

export function SearchResultsList({ filters, onPageChange, emptyTitle, emptyDescription, emptyAction }: SearchResultsListProps) {
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
        className="rounded-[10px] border border-danger/20 bg-danger/5 p-8 text-center space-y-3"
      >
        <p className="text-sm font-semibold text-foreground">
          Không thể tải kết quả lúc này. Vui lòng thử lại.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div data-testid="search-results-empty" className="flex min-h-64 flex-col items-center justify-center rounded-[10px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"><SearchX className="h-6 w-6" /></span>
        <div className="mt-4 space-y-1.5">
          <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
            {emptyTitle || 'Không tìm thấy bài viết phù hợp'}
          </h3>
          <p className="mx-auto max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            {emptyDescription || 'Hãy thử từ khóa khác hoặc điều chỉnh bộ lọc để khám phá thêm nội dung.'}
          </p>
        </div>
        {emptyAction && <Link href={emptyAction.href} className="mt-5 inline-flex min-h-10 items-center rounded-[8px] bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:bg-emerald-500 dark:text-slate-950">{emptyAction.label}</Link>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Results Summary */}
      <div data-testid="search-results-summary" className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Tìm thấy {meta?.totalItems ?? posts.length} bài viết</span>
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
        <div className="flex items-center justify-between border-t border-border pt-4 text-sm font-medium text-muted-foreground">
          <div>Trang {meta.page} / {meta.totalPages}</div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, (filters.page || 1) - 1))}
              disabled={!meta.hasPreviousPage}
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((filters.page || 1) + 1)}
              disabled={!meta.hasNextPage}
              aria-label="Trang tiếp theo"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
