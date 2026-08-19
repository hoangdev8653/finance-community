'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export type FeedSortOption = 'latest' | 'recent';

interface FeedSorterProps {
  currentSort: FeedSortOption;
  onSortChange: (sort: FeedSortOption) => void;
}

export function FeedSorter({ currentSort, onSortChange }: FeedSorterProps) {
  const toggleSort = () => {
    onSortChange(currentSort === 'latest' ? 'recent' : 'latest');
  };

  return (
    <button
      type="button"
      onClick={toggleSort}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white transition-all shadow-2xs cursor-pointer"
      aria-label="Toggle sort order"
    >
      <span>Sort</span>
      <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
    </button>
  );
}
