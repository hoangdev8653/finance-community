'use client';

import React, { useState } from 'react';
import { SeriesDetailResponse, SeriesArticleItem } from '@/types/series';
import { seriesService } from '@/lib/series/series-service';
import { SeriesHeader } from './SeriesHeader';
import { SeriesChapterList } from './SeriesChapterList';

interface SeriesViewProps {
  initialData: SeriesDetailResponse;
  slug: string;
}

export function SeriesView({ initialData, slug }: SeriesViewProps) {
  const [chapters, setChapters] = useState<SeriesArticleItem[]>(
    initialData.articles
  );
  const [currentPage, setCurrentPage] = useState(initialData.meta.page);
  const [hasNextPage, setHasNextPage] = useState(initialData.meta.hasNextPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (!hasNextPage || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const response = await seriesService.getBySlug(slug, {
        page: nextPage,
        limit: 20,
      });

      // Filter out any duplicates and append
      const existingIds = new Set(chapters.map((c) => c.id));
      const newChapters = response.articles.filter((c) => !existingIds.has(c.id));

      setChapters((prev) => [...prev, ...newChapters]);
      setCurrentPage(response.meta.page);
      setHasNextPage(response.meta.hasNextPage);
    } catch {
      // Error handling: gracefully leave state unchanged
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <SeriesHeader
        name={initialData.series.name}
        description={initialData.series.description}
        totalArticles={initialData.meta.totalItems}
        createdAt={initialData.series.createdAt}
      />

      {/* Chapters Syllabus */}
      <SeriesChapterList
        chapters={chapters}
        hasNextPage={hasNextPage}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
