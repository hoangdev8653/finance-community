'use client';

import React, { useState, useEffect } from 'react';
import { useCategories } from '@/lib/posts/use-posts-feed';
import { useSearchTags } from '@/lib/search/use-search';
import { SearchFilterState } from '@/types/search';
import { Button } from '@/components/ui/Button';
import { SlidersHorizontal, RotateCcw, Search, X } from 'lucide-react';

interface SearchFilterBarProps {
  filters: SearchFilterState;
  onChange: (newFilters: SearchFilterState) => void;
}

export function SearchFilterBar({ filters, onChange }: SearchFilterBarProps) {
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useSearchTags('', 30);
  const [localQuery, setLocalQuery] = useState(filters.query || '');

  // Keep local search input synced with external filter state
  useEffect(() => {
    setLocalQuery(filters.query || '');
  }, [filters.query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({
      ...filters,
      query: localQuery.trim() || undefined,
      page: 1,
    });
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    onChange({
      ...filters,
      query: undefined,
      page: 1,
    });
  };

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
    setLocalQuery('');
    onChange({
      query: undefined,
      contentType: 'ALL',
      categoryId: undefined,
      tagId: undefined,
      sortBy: 'publishedAt',
      order: 'DESC',
      page: 1,
    });
  };

  const hasActiveFilters =
    Boolean(filters.query?.trim()) ||
    filters.contentType !== 'ALL' ||
    Boolean(filters.categoryId) ||
    Boolean(filters.tagId) ||
    filters.sortBy !== 'publishedAt' ||
    filters.order !== 'DESC';

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      {/* 1. Primary Keyword Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Tìm bài viết, chủ đề hoặc mã chứng khoán (VD: FPT, lãi suất...)"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded transition"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="shrink-0 gap-1.5 px-5 font-sans text-xs font-semibold rounded-xl cursor-pointer"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Tìm kiếm</span>
        </Button>
      </form>

      {/* 2. Filter Toolbar Header */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Bộ lọc</span>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs font-sans h-7 px-2.5 gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Đặt lại bộ lọc</span>
          </Button>
        )}
      </div>

      {/* 3. Filter Controls Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Content Type Scoping */}
        <div className="space-y-1">
          <label htmlFor="filter-content-type" className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Định dạng
          </label>
          <select
            id="filter-content-type"
            value={filters.contentType || 'ALL'}
            onChange={(e) => handleContentTypeChange(e.target.value as any)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="ALL">Tất cả định dạng</option>
            <option value="SERIES">Chuyên đề học tập</option>
            <option value="COMMUNITY">Phân tích cộng đồng</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-1">
          <label htmlFor="filter-category" className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Chuyên mục
          </label>
          <select
            id="filter-category"
            value={filters.categoryId || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Tất cả chuyên mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} · {cat.scope === 'SERIES' ? 'Khóa học' : 'Cộng đồng'}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div className="space-y-1">
          <label htmlFor="filter-tag" className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Thẻ chủ đề
          </label>
          <select
            id="filter-tag"
            value={filters.tagId || ''}
            onChange={(e) => handleTagChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Tất cả chủ đề</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                #{tag.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Field */}
        <div className="space-y-1">
          <label htmlFor="filter-sort-by" className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Sắp xếp theo
          </label>
          <select
            id="filter-sort-by"
            value={filters.sortBy || 'publishedAt'}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="publishedAt">Ngày đăng bài</option>
            <option value="createdAt">Ngày khởi tạo</option>
          </select>
        </div>

        {/* Sort Order Direction */}
        <div className="space-y-1">
          <label htmlFor="filter-order" className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Thứ tự thời gian
          </label>
          <select
            id="filter-order"
            value={filters.order || 'DESC'}
            onChange={(e) => handleOrderChange(e.target.value as any)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="DESC">Mới nhất trước</option>
            <option value="ASC">Cũ nhất trước</option>
          </select>
        </div>
      </div>
    </div>
  );
}
