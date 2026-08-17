import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function NotificationSkeleton() {
  return (
    <div className="space-y-3 py-2 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-start gap-3.5 p-4 rounded-lg border border-border bg-surface"
        >
          <Skeleton className="h-8 w-8 rounded-full shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1 min-w-0">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
