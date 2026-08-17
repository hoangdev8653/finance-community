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
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
        <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
        <div className="h-8 w-28 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="toolbar" aria-label="Filter by category">
      <button
        type="button"
        onClick={() => onSelectCategory(undefined)}
        aria-pressed={!selectedCategoryId}
        className={cn(
          'px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary',
          !selectedCategoryId
            ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
            : 'border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        All Topics
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
              'px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary',
              isSelected
                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                : 'border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
