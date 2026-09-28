'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsService } from '@/lib/posts/posts-service';

interface CategorySelectorProps {
  value?: string;
  scope: 'SERIES' | 'COMMUNITY';
  onChange: (categoryId: string) => void;
  domainId?: string;
}

export function CategorySelector({
  value,
  scope,
  onChange,
  domainId,
}: CategorySelectorProps) {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', 'list', scope, domainId],
    queryFn: () => postsService.getCategories({ scope, domainId }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="post-category-select"
        className="block text-sm font-bold text-slate-900 dark:text-slate-100"
      >
        Chủ đề / Chuyên mục <span className="text-danger">*</span>
      </label>
      <select
        id="post-category-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading || !domainId}
        className="w-full h-11 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 shadow-2xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        <option value="">
          {!domainId ? 'Vui lòng chọn lĩnh vực trước...' : 'Chọn chủ đề / chuyên mục...'}
        </option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
