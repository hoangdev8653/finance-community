import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function PostCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 space-y-4 shadow-2xs animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-12" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
