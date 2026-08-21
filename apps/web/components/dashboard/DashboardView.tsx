'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PenSquare, LayoutDashboard } from 'lucide-react';
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

export function DashboardView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTabType>('published');
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
    limit: 20,
  });

  const {
    data: bookmarksData,
    isLoading: isBookmarksLoading,
    isError: isBookmarksError,
  } = useDashboardBookmarks(page, 20, isBookmarkTab);

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-medium">
            <LayoutDashboard className="h-4 w-4" />
            <span className="uppercase tracking-widest">Creator Workspace</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Research & Portfolio Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Manage your financial publications, track reader engagement, and draft in-depth valuation models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" asChild>
            <Link href="/posts/create" className="inline-flex items-center gap-1.5 shadow-xs">
              <PenSquare className="h-4 w-4" />
              <span>New Analysis</span>
            </Link>
          </Button>
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
