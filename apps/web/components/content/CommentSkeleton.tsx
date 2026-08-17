import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function CommentSkeleton() {
  return (
    <div className="space-y-6 py-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-4 space-y-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="space-y-2 pt-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
