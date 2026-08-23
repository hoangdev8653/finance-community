'use client';

import React from 'react';
import { SeriesArticleItem } from '@/types/series';
import { SeriesChapterItem } from './SeriesChapterItem';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { BookOpen, ChevronDown } from 'lucide-react';

interface SeriesChapterListProps {
  chapters: SeriesArticleItem[];
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function SeriesChapterList({
  chapters,
  hasNextPage = false,
  isLoadingMore = false,
  onLoadMore,
}: SeriesChapterListProps) {
  if (chapters.length === 0) {
    return (
      <section className="space-y-4 pt-4">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Curriculum Syllabus
        </h2>
        <EmptyState
          icon={BookOpen}
          title="No published chapters in this series yet."
          description="The author is currently drafting and preparing curriculum notes for this track."
        />
      </section>
    );
  }

  return (
    <section className="space-y-4 pt-4" aria-label="Curriculum Syllabus">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Curriculum Syllabus
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
        </span>
      </div>

      {/* Chapters Sequential List */}
      <div className="space-y-3">
        {chapters.map((chapter, index) => (
          <SeriesChapterItem
            key={chapter.id}
            chapter={chapter}
            sequenceNumber={index + 1}
          />
        ))}
      </div>

      {/* Load More Pagination Trigger */}
      {hasNextPage && (
        <div className="flex justify-center pt-6">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onLoadMore}
            isLoading={isLoadingMore}
            className="font-mono text-xs gap-1.5 min-w-[180px]"
          >
            <span>Load More Chapters</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </section>
  );
}
