'use client';

import React from 'react';
import { useCategories } from '@/lib/posts/use-posts-feed';
import { cn } from '@/lib/utils/cn';

interface CategoryFilterBarProps {
  selectedCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
}

export function CategoryFilterBar({
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterBarProps) {
  const { data: fetchedCategories = [], isLoading } = useCategories();

  // Only show COMMUNITY scope categories on home feed (exclude SERIES)
  const categories = fetchedCategories.filter((c) => c.scope === 'COMMUNITY');

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-full" />
        <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-full" />
        <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-full" />
        <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none" role="toolbar" aria-label="Filter by category">
      <button
        type="button"
        onClick={() => onSelectCategory(undefined)}
        aria-pressed={!selectedCategoryId}
        aria-label="All Topics"
        className={cn(
          'px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer',
          !selectedCategoryId
            ? 'bg-blue-600 text-white font-bold shadow-xs'
            : 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
      >
        All
      </button>

      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            aria-pressed={isSelected}
            className={cn(
              'px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer',
              isSelected
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
