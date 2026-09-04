'use client';

import React from 'react';
import { useSearchDiscovery } from '@/lib/search/use-search';
import { useCategoryMap } from '@/lib/posts/use-posts-feed';
import { SearchFilterState } from '@/types/search';
import { PostEntity } from '@/types/content';
import { PostCard } from '@/components/content/PostCard';
import { PostCardSkeleton } from '@/components/content/PostCardSkeleton';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { SearchX } from 'lucide-react';

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
        className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3"
      >
        <p className="text-sm font-semibold text-foreground">
          Không thể tải danh sách kết quả tìm kiếm.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="cursor-pointer">
          Thử lại
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
        <SearchX className="h-10 w-10 text-muted-foreground mx-auto" />
        <div className="space-y-1">
          <h3 className="text-sm font-heading font-bold text-foreground">
            Không tìm thấy bài viết phù hợp
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {filters.query
              ? `Không có bài viết nào khớp với từ khóa "${filters.query}". Hãy thử từ khóa khác hoặc bỏ bớt các bộ lọc.`
              : 'Hãy thử chọn chuyên mục, chủ đề hoặc định dạng bài viết khác.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Results Summary */}
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
        <span>
          Tìm thấy <span className="font-bold text-foreground">{meta?.totalItems ?? posts.length}</span> bài viết
          {filters.query ? ` cho từ khóa "${filters.query}"` : ''}
        </span>
        {meta && (
          <span>
            Trang {meta.page} / {meta.totalPages}
          </span>
        )}
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

      {/* Unified Pagination Component */}
      {meta && (
        <Pagination
          meta={meta}
          onPageChange={onPageChange}
          itemLabel="bài viết"
          pageLabel="Trang"
          scrollToTop={true}
          className="rounded-xl border border-border bg-card shadow-2xs"
        />
      )}
    </div>
  );
}
