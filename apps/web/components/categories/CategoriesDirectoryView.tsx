'use client';

import React, { useMemo } from 'react';
import { Grid, Layers, BookOpen, RefreshCw } from 'lucide-react';
import { useCategories } from '@/lib/posts/use-posts-feed';
import { CategoryCard } from './CategoryCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';

export function CategoriesDirectoryView() {
  const { data: categories = [], isLoading, isError, error, refetch } = useCategories();

  const communityCategories = useMemo(
    () => categories.filter((c) => c.scope === 'COMMUNITY').sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const seriesCategories = useMemo(
    () => categories.filter((c) => c.scope === 'SERIES').sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-3 py-1 rounded-md font-mono">
          <Grid className="h-3.5 w-3.5" />
          <span>Danh mục & Lĩnh vực nghiên cứu</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100">
          Danh mục Tri thức & Khóa học
        </h1>
        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed font-normal">
          Khám phá các phân mục nghiên cứu tài chính có cấu trúc, các lớp tài sản đầu tư và hệ thống giáo trình đào tạo bài bản trên MorningView.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-10 animate-pulse" aria-busy="true" aria-label="Loading categories">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 rounded-sm" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <ErrorState
          title="Không thể tải danh mục"
          message={error instanceof Error ? error.message : 'Đã có lỗi xảy ra trong quá trình nạp danh mục.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Content State */}
      {!isLoading && !isError && (
        <>
          {categories.length === 0 ? (
            <EmptyState
              title="Chưa có danh mục nào"
              description="Hiện chưa có danh mục nào được đăng ký trên hệ thống."
            />
          ) : (
            <div className="space-y-12">
              {/* Community Research Sectors */}
              {communityCategories.length > 0 && (
                <section className="space-y-4" aria-labelledby="community-categories-heading">
                  <div className="flex items-center gap-2 border-b border-slate-300 dark:border-slate-800 pb-3">
                    <Layers className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                    <h2
                      id="community-categories-heading"
                      className="font-heading text-2xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100"
                    >
                      Phân mục Nghiên cứu & Phân tích Thị trường
                    </h2>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-auto font-mono">
                      {communityCategories.length} phân mục
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {communityCategories.map((category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                  </div>
                </section>
              )}

              {/* Educational Series Curriculums */}
              {seriesCategories.length > 0 && (
                <section className="space-y-4" aria-labelledby="series-categories-heading">
                  <div className="flex items-center gap-2 border-b border-slate-300 dark:border-slate-800 pb-3">
                    <BookOpen className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                    <h2
                      id="series-categories-heading"
                      className="font-heading text-2xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100"
                    >
                      Giáo trình & Chuỗi bài Đào tạo Chuyên sâu
                    </h2>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-auto font-mono">
                      {seriesCategories.length} chuỗi bài
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {seriesCategories.map((category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
