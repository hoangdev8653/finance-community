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
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const articleLabel =
    totalArticles === 1 ? '1 Chapter' : `${totalArticles} Chapters`;

  return (
    <header className="rounded-xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-2xs">
      {/* Back Link & Track Tag */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/series"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
          aria-label="Back to educational series catalog"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Educational Series</span>
        </Link>
        <Badge variant="outline" className="font-mono text-2xs py-0.5 px-2 bg-muted/40 gap-1">
          <BookOpen className="h-3 w-3 text-primary" />
          <span>Curriculum</span>
        </Badge>
      </div>

      {/* Series Title */}
      <div className="space-y-3">
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          {name}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {/* Curriculum Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground pt-4 border-t border-border/60">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span>{articleLabel}</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Published {formattedDate}</span>
        </div>
      </div>
    </header>
  );
}
