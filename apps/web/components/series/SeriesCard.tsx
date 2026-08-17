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
    series.publishedArticleCount === 1 ? '1 Chapter' : `${series.publishedArticleCount} Chapters`;

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-2xs hover:border-primary/50 hover:shadow-xs transition-all duration-200">
      <div className="space-y-3">
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span className="uppercase tracking-wider text-2xs">Curriculum</span>
          </div>
          <Badge variant="outline" className="font-mono text-2xs py-0.5 px-2 bg-muted/40">
            {articleLabel}
          </Badge>
        </div>

        {/* Series Title */}
        <h2 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          <Link
            href={`/series/${encodeURIComponent(series.slug)}`}
            className="focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
          >
            {series.name}
          </Link>
        </h2>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {series.description || 'Structured institutional research curriculum and analytical frameworks.'}
        </p>
      </div>

      {/* Footer / CTA */}
      <div className="pt-5 mt-4 border-t border-border/60 flex items-center justify-between">
        <span className="text-2xs font-mono text-muted-foreground">
          Track #{series.sortOrder}
        </span>

        <Link
          href={`/series/${encodeURIComponent(series.slug)}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-primary font-medium hover:underline focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
          aria-label={`Explore syllabus for ${series.name}`}
        >
          <span>Explore Syllabus</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
