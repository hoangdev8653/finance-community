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
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-3 py-1 rounded-md font-mono">
          <Compass className="h-3.5 w-3.5" />
          <span>Kho lưu trữ bài viết & Phân tích</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100">
          Khám phá Bài viết & Nghiên cứu Tài chính
        </h1>
        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed font-normal">
          Tìm kiếm, phân loại và nghiên cứu các bài viết phân tích vĩ mô, bóc tách doanh nghiệp và chuỗi bài giảng chuyên sâu từ các chuyên gia cộng đồng.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
        {/* Left: Content Type Segments */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 p-1" role="group" aria-label="Filter content type">
          <button
            type="button"
            onClick={() => onContentTypeChange(undefined)}
            aria-pressed={!contentType}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
              !contentType
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
            }`}
          >
            Tất cả nội dung
          </button>
          <button
            type="button"
            onClick={() => onContentTypeChange('COMMUNITY')}
            aria-pressed={contentType === 'COMMUNITY'}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
              contentType === 'COMMUNITY'
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
            }`}
          >
            Bài phân tích
          </button>
          <button
            type="button"
            onClick={() => onContentTypeChange('SERIES')}
            aria-pressed={contentType === 'SERIES'}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
              contentType === 'SERIES'
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
            }`}
          >
            Chuỗi bài Series
          </button>
        </div>

        {/* Right: Category Dropdown, Sort Dropdown, Reset Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500 pointer-events-none" />
            <select
              value={categoryId || ''}
              onChange={(e) => onCategoryChange(e.target.value || undefined)}
              aria-label="Filter by category"
              className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.scope === 'SERIES' ? 'Series' : 'Cộng đồng'})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'publishedAt' | 'createdAt')}
              aria-label="Sort articles"
              className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="publishedAt">Mới xuất bản nhất</option>
              <option value="createdAt">Ngày tạo</option>
            </select>
          </div>

          {/* Reset Filters CTA */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-10 px-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Đặt lại</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
