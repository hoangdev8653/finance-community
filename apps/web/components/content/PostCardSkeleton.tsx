import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function PostCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 py-5 border-b border-dashed border-slate-200 dark:border-slate-800 last:border-b-0">
      {/* Thumbnail placeholder */}
      <Skeleton className="w-full sm:w-56 md:w-64 lg:w-72 h-44 sm:h-38 md:h-44 rounded-none shrink-0" />

      {/* Content skeleton: Title -> Category & Time -> Excerpt */}
      <div className="flex-1 min-w-0 space-y-2 pt-0.5 w-full">
        <Skeleton className="h-6 w-5/6 rounded-none" />
        <Skeleton className="h-4 w-1/3 rounded-none" />
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-4 w-full rounded-none" />
          <Skeleton className="h-4 w-3/4 rounded-none" />
        </div>
      </div>
    </div>
  );
}
