import React from 'react';
import Link from 'next/link';
import { Layers, BookOpen, ChevronRight, Folder } from 'lucide-react';
import { CategoryEntity } from '@/types/content';
import { Badge } from '@/components/ui/Badge';

interface CategoryCardProps {
  category: CategoryEntity;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const isSeries = category.scope === 'SERIES';
  const targetHref = isSeries ? `/series` : `/posts?categoryId=${encodeURIComponent(category.id)}`;

  return (
    <Link
      href={targetHref}
      className="group flex flex-col justify-between rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 transition-all duration-200 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md shadow-xs"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs">
            {isSeries ? <BookOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
          </div>
          <span
            className={`font-mono text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full border ${
              isSeries
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-700'
            }`}
          >
            {category.scope === 'SERIES' ? 'Chuỗi bài' : 'Cộng đồng'}
          </span>
        </div>

        <div>
          <h3 className="font-heading text-xl font-bold text-slate-950 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
            {category.name}
          </h3>
          <p className="mt-2 text-sm sm:text-base text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed font-normal">
            {category.description || 'Phân tích chuyên sâu và tri thức tài chính thực chiến.'}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3.5 text-sm font-bold text-emerald-800 dark:text-emerald-400 group-hover:text-emerald-950 dark:group-hover:text-emerald-300 transition-colors">
        <span>{isSeries ? 'Khám phá giáo trình' : 'Xem các bài phân tích'}</span>
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
