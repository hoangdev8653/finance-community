'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PenSquare, LayoutDashboard } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import {
  useDashboardMetrics,
  useDashboardPosts,
  useDashboardBookmarks,
  useDashboardMutations,
} from '../../lib/dashboard/use-dashboard';
import { DashboardTabType } from '../../types/dashboard';
import { DashboardMetricsBar } from './DashboardMetricsBar';
import { DashboardTabs } from './DashboardTabs';
import { DashboardPostsList } from './DashboardPostsList';
import { DashboardSkeleton } from './DashboardSkeleton';
import { Button } from '../ui/Button';
import { LearningProgressPanel } from '../learning/LearningProgressPanel';
import { DEFAULT_PAGE_SIZE } from '../../lib/constants/pagination';

interface DashboardViewProps {
  initialTab?: DashboardTabType;
}

export function DashboardView({ initialTab }: DashboardViewProps = {}) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryTab = searchParams?.get('tab') as DashboardTabType | null;
  const validTabs: DashboardTabType[] = ['published', 'drafts', 'archived', 'bookmarks'];
  const resolvedTab = initialTab || (queryTab && validTabs.includes(queryTab) ? queryTab : 'published');

  const [activeTab, setActiveTab] = useState<DashboardTabType>(resolvedTab);
  const [page, setPage] = useState<number>(1);

  const isBookmarkTab = activeTab === 'bookmarks';

  const statusMap: Record<Exclude<DashboardTabType, 'bookmarks'>, 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'> = {
    published: 'PUBLISHED',
    drafts: 'DRAFT',
    archived: 'ARCHIVED',
  };

  const { data: metrics, isLoading: isMetricsLoading } = useDashboardMetrics(user?.id);

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isError: isPostsError,
  } = useDashboardPosts(user?.id, {
    status: !isBookmarkTab ? statusMap[activeTab as Exclude<DashboardTabType, 'bookmarks'>] : undefined,
    page,
    limit: DEFAULT_PAGE_SIZE,
  });

  const {
    data: bookmarksData,
    isLoading: isBookmarksLoading,
    isError: isBookmarksError,
  } = useDashboardBookmarks(page, DEFAULT_PAGE_SIZE, isBookmarkTab);

  const { updateStatus, deletePost } = useDashboardMutations();

  const handleTabChange = (tab: DashboardTabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  if (!user) {
    return <DashboardSkeleton />;
  }

  const posts = isBookmarkTab ? bookmarksData?.data || [] : postsData?.data || [];
  const totalPages = isBookmarkTab
    ? bookmarksData?.meta?.totalPages || 1
    : postsData?.meta?.totalPages || 1;
  const totalItems = isBookmarkTab
    ? bookmarksData?.meta?.totalItems || posts.length
    : postsData?.meta?.totalItems || posts.length;
  const isLoadingActive = isBookmarkTab ? isBookmarksLoading : isPostsLoading;
  const isErrorActive = isBookmarkTab ? isBookmarksError : isPostsError;

  const defaultMetrics = metrics || {
    totalAnalyses: 0,
    draftsCount: 0,
    totalViews: 0,
    followersCount: 0,
  };

  return (
    <div className="space-y-8">
      <LearningProgressPanel />
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-300 dark:border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-3 py-1 rounded-md font-mono">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Không gian Học tập</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100">
            Bảng điều khiển Học tập
          </h1>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
            Theo dõi những gì bạn đang học, khám phá series mới và duy trì tiến độ mỗi ngày.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/series"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition-all shadow-sm"
          >
            <PenSquare className="h-4.5 w-4.5" />
            <span>Khám phá series</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Bar */}
      <DashboardMetricsBar
        metrics={defaultMetrics}
        isLoading={isMetricsLoading}
      />

      {/* Main Content Workspace */}
      <div className="space-y-6">
        <DashboardTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          publishedCount={defaultMetrics.totalAnalyses}
          draftsCount={defaultMetrics.draftsCount}
        />

        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="min-h-[300px]"
        >
          {isLoadingActive ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-5 rounded-lg border border-border bg-surface h-40"
                />
              ))}
            </div>
          ) : (
            <DashboardPostsList
              posts={posts}
              isLoading={isLoadingActive}
              isError={isErrorActive}
              activeTab={activeTab}
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setPage}
              onUpdateStatus={(postId, status) => updateStatus({ postId, status })}
              onDeletePost={deletePost}
            />
          )}
        </div>
      </div>
    </div>
  );
}
