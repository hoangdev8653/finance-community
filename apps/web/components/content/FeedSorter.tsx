'use client';

import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type FeedSortOption = 'latest' | 'recent';

interface FeedSorterProps {
  currentSort: FeedSortOption;
  onSortChange: (sort: FeedSortOption) => void;
}

export function FeedSorter({ currentSort, onSortChange }: FeedSorterProps) {
  return (
    <div className="flex items-center gap-1 p-0.5 rounded-md border border-border bg-surface text-xs" role="tablist" aria-label="Sort feed items">
      <button
        type="button"
        role="tab"
        aria-selected={currentSort === 'latest'}
        onClick={() => onSortChange('latest')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary',
          currentSort === 'latest'
            ? 'bg-muted text-foreground font-semibold shadow-2xs'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Clock className="h-3 w-3" />
        <span>Latest</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={currentSort === 'recent'}
        onClick={() => onSortChange('recent')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary',
          currentSort === 'recent'
            ? 'bg-muted text-foreground font-semibold shadow-2xs'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Sparkles className="h-3 w-3" />
        <span>Recent</span>
      </button>
    </div>
  );
}
