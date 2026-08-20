'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { HeroSection } from '@/components/content/HeroSection';
import { CategoryFilterBar } from '@/components/content/CategoryFilterBar';
import { TagFilterBar } from '@/components/content/TagFilterBar';
import { FeedSorter, FeedSortOption } from '@/components/content/FeedSorter';
import { FeedList } from '@/components/content/FeedList';
import { TrendingTagsWidget } from '@/components/content/TrendingTagsWidget';
import { TopContributorsWidget } from '@/components/content/TopContributorsWidget';
import { EditorialStandardsWidget } from '@/components/content/EditorialStandardsWidget';
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

  const rightSidebar = (
    <div className="space-y-6">
      <TrendingTagsWidget />
      <TopContributorsWidget />
      <EditorialStandardsWidget />
    </div>
  );

  return (
    <AppShell showRightSidebar={true} rightSidebar={rightSidebar}>
      <div className="space-y-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: currentType === 'SERIES' ? 'Educational Series' : 'Editorial Feed' },
          ]}
        />

        {/* Hero Section Banner */}
        <HeroSection />

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

        {/* Feed Controls: Header label & Sort */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            <span>
              {currentCategory || currentTag
                ? 'Filtered Articles'
                : 'Curated Articles & Insights'}
            </span>
            <ChevronDown className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
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
      </div>
    </AppShell>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="py-20">
          <LoadingState message="Loading curated financial insights..." />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
