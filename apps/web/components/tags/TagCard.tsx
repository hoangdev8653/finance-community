import React from 'react';
import Link from 'next/link';
import { Hash } from 'lucide-react';
import { TagEntity } from '@/types/content';
import { Badge } from '@/components/ui/Badge';

interface TagCardProps {
  tag: TagEntity;
}

export function TagCard({ tag }: TagCardProps) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag.slug)}`}
      className="group flex items-center justify-between gap-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-200 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-sm shadow-2xs"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-100 group-hover:text-emerald-950 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-200 transition-colors">
          <Hash className="h-4 w-4" />
        </div>
        <span className="truncate text-base font-bold text-slate-950 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
          {tag.name}
        </span>
      </div>
      <span className="shrink-0 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1 px-2.5">
        {tag.usageCount.toLocaleString()} bài
      </span>
    </Link>
  );
}
