'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface SeriesHeaderProps {
  name: string;
  description: string | null;
  totalArticles: number;
  createdAt: string;
}

export function SeriesHeader({
  name,
  description,
  totalArticles,
  createdAt,
}: SeriesHeaderProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  const articleLabel =
    totalArticles === 1 ? '1 Chapter' : `${totalArticles} Chapters`;

  return (
    <header className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Back Link & Track Tag */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/series"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-xs"
          aria-label="Quay lại danh mục giáo trình"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Tất cả Chuỗi bài Series</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold py-1 px-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Giáo trình chuẩn</span>
        </span>
      </div>

      {/* Series Title */}
      <div className="space-y-3">
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
          {name}
        </h1>
        {description && (
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl font-medium">
            {description}
          </p>
        )}
      </div>

      {/* Curriculum Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
          <Layers className="h-3.5 w-3.5" />
          <span>{totalArticles} bài học chuyên sâu</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Cập nhật {formattedDate}</span>
        </div>
      </div>
    </header>
  );
}
