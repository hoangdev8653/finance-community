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
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xs">
      {/* 1. Primary Keyword Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Tìm kiếm theo từ khóa, tiêu đề, mã chứng khoán (VD: HPG, FPT, Vĩ mô, Lãi suất...)"
            className="w-full rounded-xl border border-input bg-background pl-10 pr-9 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all"
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
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2 text-xs font-heading font-bold text-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <span>Bộ Lọc Chuyên Sâu</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        {/* Content Type Scoping */}
        <div className="space-y-1">
          <label htmlFor="filter-content-type" className="text-[11px] text-muted-foreground uppercase font-semibold font-mono">
            Định dạng
          </label>
          <select
            id="filter-content-type"
            value={filters.contentType || 'ALL'}
            onChange={(e) => handleContentTypeChange(e.target.value as any)}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Tất cả định dạng</option>
            <option value="SERIES">Chuyên đề học tập</option>
            <option value="COMMUNITY">Phân tích cộng đồng</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-1">
          <label htmlFor="filter-category" className="text-[11px] text-muted-foreground uppercase font-semibold font-mono">
            Chuyên mục
          </label>
          <select
            id="filter-category"
            value={filters.categoryId || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="">Tất cả chuyên mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.scope})
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div className="space-y-1">
          <label htmlFor="filter-tag" className="text-[11px] text-muted-foreground uppercase font-semibold font-mono">
            Thẻ chủ đề
          </label>
          <select
            id="filter-tag"
            value={filters.tagId || ''}
            onChange={(e) => handleTagChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
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
          <label htmlFor="filter-sort-by" className="text-[11px] text-muted-foreground uppercase font-semibold font-mono">
            Sắp xếp theo
          </label>
          <select
            id="filter-sort-by"
            value={filters.sortBy || 'publishedAt'}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="publishedAt">Ngày đăng bài</option>
            <option value="createdAt">Ngày khởi tạo</option>
          </select>
        </div>

        {/* Sort Order Direction */}
        <div className="space-y-1">
          <label htmlFor="filter-order" className="text-[11px] text-muted-foreground uppercase font-semibold font-mono">
            Thứ tự thời gian
          </label>
          <select
            id="filter-order"
            value={filters.order || 'DESC'}
            onChange={(e) => handleOrderChange(e.target.value as any)}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="DESC">Mới nhất trước</option>
            <option value="ASC">Cũ nhất trước</option>
          </select>
        </div>
      </div>
    </div>
  );
}
