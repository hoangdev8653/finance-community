import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProfileSkeleton() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-pulse">
      {/* Header skeleton with cover and card */}
      <div className="w-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        {/* Cover Skeleton */}
        <Skeleton className="h-36 w-full sm:h-48 md:h-52 rounded-none" />

        {/* Content Skeleton */}
        <div className="px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
          <div className="-mt-14 mb-4 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-card" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>

          <div className="mt-6 flex items-center gap-6 border-t border-border/70 pt-5">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-36" />
          </div>
        </div>
      </div>

      {/* Tabs & Content Skeleton */}
      <div className="w-full space-y-4">
        <div className="flex gap-6 border-b border-border pb-3">
          <Skeleton className="h-6 w-36" />
        </div>
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    </div>
  );
}
