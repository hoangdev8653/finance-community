'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsService } from '@/lib/posts/posts-service';

export function DomainSelector({
  value,
  onChange,
}: {
  value?: string;
  onChange: (id: string) => void;
}) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['domains', 'learning'],
    queryFn: () => postsService.getDomains(),
    staleTime: 300000,
  });

  const learningCodes = new Set(['MONEY', 'TECH', 'CAREER', 'LIFE']);

  return (
    <div className="space-y-1.5">
      <label htmlFor="post-domain-select" className="block text-sm font-bold text-slate-900 dark:text-slate-100">
        Lĩnh vực <span className="text-danger">*</span>
      </label>
      <select
        id="post-domain-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="w-full h-11 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 shadow-2xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
      >
        <option value="">Chọn lĩnh vực...</option>
        {data
          .filter((domain) => domain.isActive && learningCodes.has(domain.code))
          .map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.nameVi || domain.name}
            </option>
          ))}
      </select>
    </div>
  );
}
