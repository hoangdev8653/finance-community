'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchFilterBar } from '@/components/search/SearchFilterBar';
import { SearchResultsList } from '@/components/search/SearchResultsList';
import { SearchFilterState } from '@/types/search';
import { Compass, Loader2 } from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryText = searchParams.get('q') || '';
  const contentType = (searchParams.get('type') as any) || 'ALL';
  const categoryId = searchParams.get('category') || undefined;
  const tagId = searchParams.get('tag') || undefined;
  const sortBy = (searchParams.get('sort') as any) || 'publishedAt';
  const order = (searchParams.get('order') as any) || 'DESC';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Directly derive active filters from URL query parameters
  const filters: SearchFilterState = {
    query: queryText || undefined,
    contentType,
    categoryId,
    tagId,
    sortBy,
    order,
    page,
  };

  const handleFilterChange = (newFilters: SearchFilterState) => {
    const params = new URLSearchParams();

    if (newFilters.query?.trim()) params.set('q', newFilters.query.trim());
    if (newFilters.contentType && newFilters.contentType !== 'ALL') params.set('type', newFilters.contentType);
    if (newFilters.categoryId) params.set('category', newFilters.categoryId);
    if (newFilters.tagId) params.set('tag', newFilters.tagId);
    if (newFilters.sortBy && newFilters.sortBy !== 'publishedAt') params.set('sort', newFilters.sortBy);
    if (newFilters.order && newFilters.order !== 'DESC') params.set('order', newFilters.order);
    if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page.toString());

    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    handleFilterChange({ ...filters, page: newPage });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Compass className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Tìm Kiếm & Khám Phá Bài Viết
            </h1>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              {queryText
                ? `Kết quả tìm kiếm cho từ khóa "${queryText}"`
                : 'Khám phá tri thức, phân tích thị trường và chuyên đề học tập tài chính.'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <SearchFilterBar filters={filters} onChange={handleFilterChange} />

      {/* Results Feed */}
      <SearchResultsList filters={filters} onPageChange={handlePageChange} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
