'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Flame } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { DailyLearningStrip } from '@/components/content/DailyLearningStrip';
import { EditorialHeroGrid } from '@/components/content/EditorialHeroGrid';
import { ScopeNavigationTabs, ScopeFilter } from '@/components/content/ScopeNavigationTabs';
import { CategoryFilterBar } from '@/components/content/CategoryFilterBar';
import { FeedSorter, FeedSortOption } from '@/components/content/FeedSorter';
import { FeedList } from '@/components/content/FeedList';
import { FeaturedSeriesWidget } from '@/components/content/FeaturedSeriesWidget';
import { TrendingTagsWidget } from '@/components/content/TrendingTagsWidget';
import { TopContributorsWidget } from '@/components/content/TopContributorsWidget';
import { EditorialStandardsWidget } from '@/components/content/EditorialStandardsWidget';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useTranslation } from '@/lib/i18n/useTranslation';

function HomePageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || undefined;
  const currentTag = searchParams.get('tag') || undefined;
  const currentSortParam = searchParams.get('sort');
  const currentSort: FeedSortOption = currentSortParam === 'recent' ? 'recent' : 'latest';
  const currentTypeParam = searchParams.get('type');
  const currentType = currentTypeParam === 'SERIES' ? 'SERIES' : undefined;

  // Local state for scope filter tab
  const [currentScope, setCurrentScope] = useState<ScopeFilter>(
    currentType === 'SERIES' ? 'SERIES' : 'ALL'
  );

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

  const handleSelectScope = (scope: ScopeFilter) => {
    setCurrentScope(scope);
    if (scope === 'SERIES') {
      updateFilters({ type: 'SERIES', category: undefined, tag: undefined });
    } else if (scope === 'DOMESTIC') {
      updateFilters({ type: undefined, tag: 'corporate-finance' });
    } else if (scope === 'GLOBAL') {
      updateFilters({ type: undefined, tag: 'macroeconomics' });
    } else {
      updateFilters({ type: undefined, category: undefined, tag: undefined });
    }
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
    setCurrentScope('ALL');
    router.push(pathname);
  };

  const sortByField = currentSort === 'recent' ? 'createdAt' : 'publishedAt';

  const rightSidebar = (
    <div className="space-y-6">
      <FeaturedSeriesWidget />
      <TrendingTagsWidget />
      <TopContributorsWidget />
      <EditorialStandardsWidget />
    </div>
  );

  return (
    <AppShell showRightSidebar={true} rightSidebar={rightSidebar}>
      <div className="space-y-5">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: t('navigation.home'), href: '/' },
            { label: currentType === 'SERIES' ? t('navigation.series') : t('navigation.feedsAndDiscover') },
          ]}
        />

        {/* Daily Financial Pulse & Dispatches Strip with Controls */}
        <DailyLearningStrip />

        {/* Editorial Lead Story & Today's Latest Wire Grid */}
        <EditorialHeroGrid />

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
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <div className="py-20">
          <LoadingState message={t('common.loading')} />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
