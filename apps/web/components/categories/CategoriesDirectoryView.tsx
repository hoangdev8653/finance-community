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
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
          <Grid className="h-3.5 w-3.5" />
          <span>Research Sectors</span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Categories & Sectors
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Browse structured financial research tracks, asset classes, and structured educational curriculums authored across Finance Pulse.
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
          title="Unable to load categories"
          message={error instanceof Error ? error.message : 'An unexpected error occurred while fetching categories.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Content State */}
      {!isLoading && !isError && (
        <>
          {categories.length === 0 ? (
            <EmptyState
              title="No categories found"
              description="No research categories or sectors are currently registered in the platform."
            />
          ) : (
            <div className="space-y-12">
              {/* Community Research Sectors */}
              {communityCategories.length > 0 && (
                <section className="space-y-4" aria-labelledby="community-categories-heading">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <h2
                      id="community-categories-heading"
                      className="font-serif text-xl font-bold tracking-tight text-foreground"
                    >
                      Community Research & Analysis Sectors
                    </h2>
                    <span className="text-xs text-muted-foreground ml-auto font-mono">
                      {communityCategories.length} {communityCategories.length === 1 ? 'sector' : 'sectors'}
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
                  <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h2
                      id="series-categories-heading"
                      className="font-serif text-xl font-bold tracking-tight text-foreground"
                    >
                      Educational Curriculums & Series Tracks
                    </h2>
                    <span className="text-xs text-muted-foreground ml-auto font-mono">
                      {seriesCategories.length} {seriesCategories.length === 1 ? 'track' : 'tracks'}
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
