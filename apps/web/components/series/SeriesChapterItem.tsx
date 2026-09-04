'use client';

import React from 'react';
import Link from 'next/link';
import { SeriesArticleItem } from '@/types/series';
import { Eye, Calendar, ArrowRight } from 'lucide-react';

interface SeriesChapterItemProps {
  chapter: SeriesArticleItem;
  sequenceNumber: number;
}

export function SeriesChapterItem({
  chapter,
  sequenceNumber,
}: SeriesChapterItemProps) {
  const formattedIndex = String(sequenceNumber).padStart(2, '0');
  const formattedDate = chapter.publishedAt
    ? new Date(chapter.publishedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Bản nháp';

  const readerUrl = `/posts/SERIES/${encodeURIComponent(chapter.slug)}`;

  return (
    <article
      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-xs hover:border-emerald-500/60 hover:shadow-md transition-all duration-200"
      aria-label={`Chương ${sequenceNumber}: ${chapter.title}`}
    >
      {/* Number Index & Title */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-slate-800 font-heading text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          {formattedIndex}
        </div>

        <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
          <Link
            href={readerUrl}
            className="focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-xs"
          >
            {chapter.title}
          </Link>
        </h3>
      </div>

      {/* Meta Bar & Read CTA */}
      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 self-end sm:self-center">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          <span>{chapter.viewCount} lượt xem</span>
        </div>

        <Link
          href={readerUrl}
          className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-xs pl-2"
          aria-label={`Đọc Chương ${sequenceNumber}: ${chapter.title}`}
        >
          <span className="hidden sm:inline">Học bài</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
