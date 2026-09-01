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
        className="block text-xs font-medium text-foreground"
      >
        Chủ đề học tập
      </label>
      <select
        id="post-category-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading || !domainId}
        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
      >
        <option value="">Chọn chủ đề học tập...</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
