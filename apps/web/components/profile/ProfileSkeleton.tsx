import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>

        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />

        <div className="flex items-center gap-6 pt-4 border-t border-border">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="flex gap-4 border-b border-border pb-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
}
