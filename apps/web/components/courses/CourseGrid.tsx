'use client';

import React from 'react';
import { CourseItem } from '@/types/course';
import { CourseCard } from './CourseCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { BookOpen } from 'lucide-react';

interface CourseGridProps {
  series: CourseItem[];
}

export function CourseGrid({ series }: CourseGridProps) {
  if (series.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Chưa có khóa học nào được xuất bản."
        description="Các khóa học đang được xây dựng. Hãy quay lại sớm để khám phá những chủ đề hữu ích mới."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {series.map((item) => (
        <CourseCard key={item.id} series={item} />
      ))}
    </div>
  );
}
