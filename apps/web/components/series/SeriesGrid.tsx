'use client';

import React from 'react';
import { SeriesItem } from '@/types/series';
import { SeriesCard } from './SeriesCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { BookOpen } from 'lucide-react';

interface SeriesGridProps {
  series: SeriesItem[];
}

export function SeriesGrid({ series }: SeriesGridProps) {
  if (series.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No educational series published yet."
        description="Các series bài học đang được xây dựng. Hãy quay lại sớm để khám phá những chủ đề hữu ích mới."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {series.map((item) => (
        <SeriesCard key={item.id} series={item} />
      ))}
    </div>
  );
}
