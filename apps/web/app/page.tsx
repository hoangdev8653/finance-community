'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ShieldCheck, BookOpen, Sparkles, Filter } from 'lucide-react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { CategoryFilterBar } from '@/components/content/CategoryFilterBar';
import { TagFilterBar } from '@/components/content/TagFilterBar';
import { FeedSorter, FeedSortOption } from '@/components/content/FeedSorter';
import { FeedList } from '@/components/content/FeedList';
import { LoadingState } from '@/components/feedback/LoadingState';

function HomePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || undefined;
  const currentTag = searchParams.get('tag') || undefined;
  const currentSortParam = searchParams.get('sort');
  const currentSort: FeedSortOption = currentSortParam === 'recent' ? 'recent' : 'latest';
  const currentTypeParam = searchParams.get('type');
  const currentType = currentTypeParam === 'SERIES' ? 'SERIES' : currentTypeParam === 'COMMUNITY' ? 'COMMUNITY' : undefined;

  const updateFilters = (params: Record<string, string | undefined>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleSelectCategory = (categoryId?: string) => {
    updateFilters({ category: categoryId });
  };

  const handleSelectTag = (tagId?: string) => {
    updateFilters({ tag: tagId });
  };

  const handleSortChange = (sort: FeedSortOption) => {
    updateFilters({ sort: sort === 'latest' ? undefined : sort });
  };

  const handleResetFilters = () => {
    router.push(pathname);
  };

  const sortByField = currentSort === 'recent' ? 'createdAt' : 'publishedAt';

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Desktop Navigation Sidebar (3 cols / ~260px) */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20">
            <Sidebar />
          </div>
        </aside>

        {/* Center Column: Primary Public Feed Area (6 cols / ~680px) */}
        <main className="lg:col-span-6 space-y-5">
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: currentType === 'SERIES' ? 'Educational Series' : 'Market Feed' },
            ]}
          />

          {/* Feed Header & Headline */}
          <div className="border-b border-border pb-4">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Financial Analysis & Market Intelligence
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Curated editorial breakdowns, macroeconomic research, and community investment theses.
            </p>
          </div>

          {/* Category Filter Pills */}
          <CategoryFilterBar
            selectedCategoryId={currentCategory}
            onSelectCategory={handleSelectCategory}
          />

          {/* Tag Filter Bar */}
          <TagFilterBar
            selectedTagId={currentTag}
            onSelectTag={handleSelectTag}
          />

          {/* Feed Controls: Sorter & Active Filters Indicator */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Filter className="h-3.5 w-3.5" />
              <span>
                {currentCategory || currentTag
                  ? 'Filtered Stream'
                  : 'All Published Analyses'}
              </span>
            </div>

            <FeedSorter
              currentSort={currentSort}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Feed List Stream */}
          <FeedList
            contentType={currentType}
            categoryId={currentCategory}
            tagId={currentTag}
            sortBy={sortByField}
            onResetFilters={handleResetFilters}
          />
        </main>

        {/* Right Column: Platform Standards & Highlight Widgets (3 cols / ~320px) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          {/* Editorial Standards Box */}
          <div className="rounded-lg border border-border bg-surface p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Editorial Standards</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every financial analysis on Finance Pulse adheres to independent analytical integrity.
              Content is reviewed for factual rigor and source transparency.
            </p>
          </div>

          {/* Educational Series Spotlight */}
          <div className="rounded-lg border border-border bg-surface p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Curated Learning</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore step-by-step educational curricula on valuation multiples, fixed income modeling,
              and macroeconomic indicators.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="py-20">
          <LoadingState message="Loading financial intelligence feed..." />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
