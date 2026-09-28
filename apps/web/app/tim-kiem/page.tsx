'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchFilterBar } from '@/components/search/SearchFilterBar';
import { SearchResultsList } from '@/components/search/SearchResultsList';
import { SearchFilterState } from '@/types/search';
import { Compass, Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [filters, setFilters] = useState<SearchFilterState>({
    query: searchParams.get('q') || undefined,
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

    router.push(`/tim-kiem?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    handleFilterChange({ ...filters, page: newPage });
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-3.5 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-teal-100/70 p-6 sm:p-8 dark:border-emerald-900/60 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950/40">
        <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-700/15" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/15 dark:bg-emerald-500 dark:text-slate-950">
            <Compass className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300"><Sparkles className="h-3.5 w-3.5" /> Khám phá BrewSeven</p>
            <h1 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">{t('search.title')}</h1>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {queryText ? t('search.resultsFor', { query: queryText }) : 'Tìm bài học, bài viết cộng đồng và chủ đề bạn quan tâm.'}
            </p>
          </div>
        </div>
      </header>

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
