import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Hash } from 'lucide-react';
import { TagEntity } from '@/types/content';

interface TagCardProps {
  tag: TagEntity;
}

export function TagCard({ tag }: TagCardProps) {
  return (
    <Link
      href={`/the/${encodeURIComponent(tag.slug)}`}
      className="group flex min-h-[92px] items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-600"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-700 group-hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:group-hover:bg-emerald-500 dark:group-hover:text-slate-950">
          <Hash className="h-4 w-4" />
        </div>
        <span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-950 transition-colors group-hover:text-emerald-800 dark:text-slate-100 dark:group-hover:text-emerald-300">{tag.name}</span><span className="mt-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{typeof tag.usageCount === 'number' && Number.isFinite(tag.usageCount) ? `${tag.usageCount.toLocaleString('vi-VN')} bài viết` : 'Khám phá chủ đề'}</span></span>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" aria-hidden="true" />
    </Link>
  );
}
