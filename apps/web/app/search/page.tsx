'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchFilterBar } from '@/components/search/SearchFilterBar';
import { SearchResultsList } from '@/components/search/SearchResultsList';
import { SearchFilterState } from '@/types/search';
import { Search, Compass, Loader2 } from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<SearchFilterState>({
    contentType: (searchParams.get('type') as any) || 'ALL',
    categoryId: searchParams.get('category') || undefined,
    tagId: searchParams.get('tag') || undefined,
    sortBy: (searchParams.get('sort') as any) || 'publishedAt',
    order: (searchParams.get('order') as any) || 'DESC',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  const queryText = searchParams.get('q') || '';

  const handleFilterChange = (newFilters: SearchFilterState) => {
    setFilters(newFilters);
    const params = new URLSearchParams();

    if (queryText) params.set('q', queryText);
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
              Khám phá và tìm kiếm
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {queryText
                ? `Results for keyword "${queryText}"`
                : 'Explore articles across analytical taxonomy, format, and topics.'}
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
