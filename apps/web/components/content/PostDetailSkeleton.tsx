import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function PostDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-sm" />
          <Skeleton className="h-6 w-20 rounded-sm" />
        </div>
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-10 w-3/5" />

        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Cover image skeleton */}
      <Skeleton className="h-80 w-full rounded-lg" />

      {/* Body lines skeleton */}
      <div className="space-y-4 pt-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    </div>
  );
}
