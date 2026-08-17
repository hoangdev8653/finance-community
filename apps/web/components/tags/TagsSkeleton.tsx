import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function TagsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading market tags">
      {/* Search Bar Skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-full max-w-md rounded-md" />
      </div>

      {/* Popular Tags Section Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-44 rounded-sm" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Grouped Tags Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-5 w-32 rounded-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
