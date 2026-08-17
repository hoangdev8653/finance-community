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
    ? new Date(chapter.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft';

  const readerUrl = `/posts/SERIES/${encodeURIComponent(chapter.slug)}`;

  return (
    <article
      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-lg border border-border bg-surface hover:border-primary/50 hover:bg-surface/90 transition-all duration-150"
      aria-label={`Chapter ${sequenceNumber}: ${chapter.title}`}
    >
      {/* Number Index & Title */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs font-bold text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {formattedIndex}
        </div>

        <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
          <Link
            href={readerUrl}
            className="focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
          >
            {chapter.title}
          </Link>
        </h3>
      </div>

      {/* Meta Bar & Read CTA */}
      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground shrink-0 self-end sm:self-center">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          <span>{chapter.viewCount} views</span>
        </div>

        <Link
          href={readerUrl}
          className="inline-flex items-center gap-1 text-primary font-medium hover:underline focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-xs pl-2"
          aria-label={`Read Chapter ${sequenceNumber}: ${chapter.title}`}
        >
          <span className="hidden sm:inline">Read</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
