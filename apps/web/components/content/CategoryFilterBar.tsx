'use client';

import React from 'react';
import { useCategories } from '@/lib/posts/use-posts-feed';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { cn } from '@/lib/utils/cn';

interface CategoryFilterBarProps {
  selectedCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
}

export function CategoryFilterBar({
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterBarProps) {
  const { t } = useTranslation();
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
        aria-label={t('common.all')}
        className={cn(
          'px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer',
          !selectedCategoryId
            ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-xs'
            : 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
        )}
      >
        {t('common.all')}
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
              'px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer',
              isSelected
                ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-xs'
                : 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            )}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
