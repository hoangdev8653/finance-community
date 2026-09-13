'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { CourseView } from '@/components/courses/CourseView';
import { learningCourseService } from '@/lib/learning/learning-course-service';
import type { LearningPathDetail } from '@/types/learning-course';

export default function LearningPathDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [path, setPath] = useState<LearningPathDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    void params.then(async ({ slug }) => {
      try { setPath(await learningCourseService.getPath(slug)); }
      catch { setError(true); }
    });
  }, [params]);

  if (error) return <main className="mx-auto max-w-4xl px-4 py-12"><Link href="/lo-trinh-hoc" className="inline-flex items-center gap-1 text-sm font-semibold text-primary"><ChevronLeft className="h-4 w-4" />Tất cả lộ trình</Link><h1 className="mt-8 text-2xl font-bold">Không tìm thấy lộ trình</h1></main>;
  if (!path) return <main className="mx-auto max-w-4xl px-4 py-12 text-sm text-muted-foreground">Đang tải lộ trình…</main>;

  return <CourseView
    slug={path.series.slug}
    presentation={{
      estimatedDurationMinutes: path.series.estimatedDurationMinutes,
      learningOutcomes: path.series.learningOutcomes,
    }}
    initialData={{
      series: {
        id: path.series.id,
        name: path.series.title,
        slug: path.series.slug,
        description: path.series.description,
        sortOrder: 0,
        createdAt: path.series.createdAt,
      },
      articles: path.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        status: 'PUBLISHED',
        publishedAt: null,
        viewCount: 0,
      })),
      meta: { page: 1, limit: path.lessons.length, totalItems: path.lessons.length, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    }}
  />;
}
