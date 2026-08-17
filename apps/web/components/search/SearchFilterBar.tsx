'use client';

import React from 'react';
import { useCategories } from '@/lib/posts/use-posts-feed';
import { useSearchTags } from '@/lib/search/use-search';
import { SearchFilterState } from '@/types/search';
import { Button } from '@/components/ui/Button';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface SearchFilterBarProps {
  filters: SearchFilterState;
  onChange: (newFilters: SearchFilterState) => void;
}

export function SearchFilterBar({ filters, onChange }: SearchFilterBarProps) {
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useSearchTags('', 30);

  const handleContentTypeChange = (contentType: 'ALL' | 'SERIES' | 'COMMUNITY') => {
    onChange({ ...filters, contentType, page: 1 });
  };

  const handleCategoryChange = (categoryId: string) => {
    onChange({
      ...filters,
      categoryId: categoryId || undefined,
      page: 1,
    });
  };

  const handleTagChange = (tagId: string) => {
    onChange({
      ...filters,
      tagId: tagId || undefined,
      page: 1,
    });
  };

  const handleSortChange = (sortBy: 'publishedAt' | 'createdAt') => {
    onChange({ ...filters, sortBy, page: 1 });
  };

  const handleOrderChange = (order: 'DESC' | 'ASC') => {
    onChange({ ...filters, order, page: 1 });
  };

  const handleReset = () => {
    onChange({
      contentType: 'ALL',
      categoryId: undefined,
      tagId: undefined,
      sortBy: 'publishedAt',
      order: 'DESC',
      page: 1,
    });
  };

  const hasActiveFilters =
    filters.contentType !== 'ALL' ||
    Boolean(filters.categoryId) ||
    Boolean(filters.tagId) ||
    filters.sortBy !== 'publishedAt' ||
    filters.order !== 'DESC';

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Discovery Filters</span>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-2xs font-mono h-6 px-2 gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
        {/* Content Type Scoping */}
        <div className="space-y-1">
          <label htmlFor="filter-content-type" className="text-3xs text-muted-foreground uppercase font-semibold">
            Content Scope
          </label>
          <select
            id="filter-content-type"
            value={filters.contentType || 'ALL'}
            onChange={(e) => handleContentTypeChange(e.target.value as any)}
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Formats</option>
            <option value="SERIES">Educational Series</option>
            <option value="COMMUNITY">Community Analysis</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-1">
          <label htmlFor="filter-category" className="text-3xs text-muted-foreground uppercase font-semibold">
            Category
          </label>
          <select
            id="filter-category"
            value={filters.categoryId || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.scope})
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div className="space-y-1">
          <label htmlFor="filter-tag" className="text-3xs text-muted-foreground uppercase font-semibold">
            Topic Tag
          </label>
          <select
            id="filter-tag"
            value={filters.tagId || ''}
            onChange={(e) => handleTagChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="">All Topics</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                #{tag.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Field */}
        <div className="space-y-1">
          <label htmlFor="filter-sort-by" className="text-3xs text-muted-foreground uppercase font-semibold">
            Sort By
          </label>
          <select
            id="filter-sort-by"
            value={filters.sortBy || 'publishedAt'}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="publishedAt">Publish Date</option>
            <option value="createdAt">Creation Date</option>
          </select>
        </div>

        {/* Sort Order Direction */}
        <div className="space-y-1">
          <label htmlFor="filter-order" className="text-3xs text-muted-foreground uppercase font-semibold">
            Chronology
          </label>
          <select
            id="filter-order"
            value={filters.order || 'DESC'}
            onChange={(e) => handleOrderChange(e.target.value as any)}
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="DESC">Newest First</option>
            <option value="ASC">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}
