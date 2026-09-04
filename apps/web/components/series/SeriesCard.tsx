'use client';

import React from 'react';
import Link from 'next/link';
import { SeriesItem } from '@/types/series';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, ArrowRight } from 'lucide-react';

interface SeriesCardProps {
  series: SeriesItem;
}

export function SeriesCard({ series }: SeriesCardProps) {
  const articleLabel =
    series.publishedArticleCount === 1 ? '1 Bài học' : `${series.publishedArticleCount} Bài học`;

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs hover:border-emerald-500/60 hover:shadow-md transition-all duration-200">
      <div className="space-y-4">
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="uppercase tracking-wider text-xs font-bold">Giáo trình đào tạo</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold py-1 px-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            {articleLabel}
          </span>
        </div>

        {/* Series Title — Enlarged Font & Bold Weight */}
        <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
          <Link
            href={`/series/${encodeURIComponent(series.slug)}`}
            className="focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-xs"
          >
            {series.name}
          </Link>
        </h2>

        {/* Description — Enlarged Font Size & Weight */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-3">
          {series.description || 'Lộ trình bài học ngắn, dễ hiểu và có thể áp dụng vào cuộc sống.'}
        </p>
      </div>

      {/* Footer / CTA */}
      <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Chuyên đề #{series.sortOrder}
        </span>

        <Link
          href={`/series/${encodeURIComponent(series.slug)}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-xs"
          aria-label={`Khám phá giáo trình ${series.name}`}
        >
          <span>Khám phá giáo trình</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
