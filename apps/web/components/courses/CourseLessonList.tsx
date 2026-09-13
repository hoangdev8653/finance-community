'use client';

import React from 'react';
import type { CourseLesson } from '@/types/course';
import { CourseLessonItem } from './CourseLessonItem';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { BookOpen, ChevronDown } from 'lucide-react';

interface CourseLessonListProps {
  chapters: CourseLesson[];
  seriesSlug: string;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function CourseLessonList({
  chapters,
  seriesSlug,
  hasNextPage = false,
  isLoadingMore = false,
  onLoadMore,
}: CourseLessonListProps) {
  if (chapters.length === 0) {
    return (
      <section className="space-y-4 pt-4">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Danh sách bài học
        </h2>
        <EmptyState
          icon={BookOpen}
          title="Khóa học này chưa có bài học được xuất bản."
          description="Các bài học đang được biên soạn. Hãy quay lại sau để tiếp tục khám phá."
        />
      </section>
    );
  }

  return (
    <section className="space-y-4 pt-4" aria-label="Danh sách bài học">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Danh sách bài học
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {chapters.length} bài học
        </span>
      </div>

      {/* Chapters Sequential List */}
      <div className="space-y-3">
        {chapters.map((chapter, index) => (
          <CourseLessonItem
            key={chapter.id}
            chapter={chapter}
            sequenceNumber={index + 1}
            seriesSlug={seriesSlug}
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
            <span>Xem thêm bài học</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </section>
  );
}
