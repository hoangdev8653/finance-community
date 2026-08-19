import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function PostCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-card">
      {/* Thumbnail placeholder */}
      <Skeleton className="w-full sm:w-44 md:w-48 h-32 sm:h-auto min-h-[110px] rounded-lg shrink-0" />

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col justify-between space-y-3 min-w-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}
