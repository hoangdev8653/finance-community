'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface SeriesSkeletonProps {
  variant?: 'grid' | 'detail';
}

export function SeriesSkeleton({ variant = 'grid' }: SeriesSkeletonProps) {
  if (variant === 'detail') {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-4 rounded-xl border border-border bg-surface p-6 sm:p-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-4 pt-2 border-t border-border/60">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Chapter List Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-48 mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface/60"
            >
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface p-6 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
