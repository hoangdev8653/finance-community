'use client';

import React from 'react';
import { Compass, Filter, ArrowUpDown, RotateCcw } from 'lucide-react';
import { CategoryEntity } from '@/types/content';
import { Button } from '@/components/ui/Button';

interface PostsExplorerHeaderProps {
  contentType?: 'SERIES' | 'COMMUNITY';
  categoryId?: string;
  sortBy: 'publishedAt' | 'createdAt';
  categories: CategoryEntity[];
  onContentTypeChange: (type?: 'SERIES' | 'COMMUNITY') => void;
  onCategoryChange: (categoryId?: string) => void;
  onSortChange: (sortBy: 'publishedAt' | 'createdAt') => void;
  onResetFilters: () => void;
}

export function PostsExplorerHeader({
  contentType,
  categoryId,
  sortBy,
  categories,
  onContentTypeChange,
  onCategoryChange,
  onSortChange,
  onResetFilters,
}: PostsExplorerHeaderProps) {
  const hasActiveFilters = Boolean(contentType || categoryId || sortBy !== 'publishedAt');

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
          <Compass className="h-3.5 w-3.5" />
          <span>Research Archives</span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Master Content & Research Explorer
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Discover, filter, and read through institutional macroeconomic research, equity deep-dives, and financial curriculums authored by community analysts.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4">
        {/* Left: Content Type Segments */}
        <div className="flex items-center gap-1.5 rounded-md bg-muted p-1" role="group" aria-label="Filter content type">
          <button
            type="button"
            onClick={() => onContentTypeChange(undefined)}
            aria-pressed={!contentType}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              !contentType
                ? 'bg-surface text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Content
          </button>
          <button
            type="button"
            onClick={() => onContentTypeChange('COMMUNITY')}
            aria-pressed={contentType === 'COMMUNITY'}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              contentType === 'COMMUNITY'
                ? 'bg-surface text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Analyses Only
          </button>
          <button
            type="button"
            onClick={() => onContentTypeChange('SERIES')}
            aria-pressed={contentType === 'SERIES'}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              contentType === 'SERIES'
                ? 'bg-surface text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Educational Series
          </button>
        </div>

        {/* Right: Category Dropdown, Sort Dropdown, Reset Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={categoryId || ''}
              onChange={(e) => onCategoryChange(e.target.value || undefined)}
              aria-label="Filter by category"
              className="h-8 rounded-md border border-border bg-surface px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.scope})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'publishedAt' | 'createdAt')}
              aria-label="Sort articles"
              className="h-8 rounded-md border border-border bg-surface px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="publishedAt">Latest Published</option>
              <option value="createdAt">Date Created</option>
            </select>
          </div>

          {/* Reset Filters CTA */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
