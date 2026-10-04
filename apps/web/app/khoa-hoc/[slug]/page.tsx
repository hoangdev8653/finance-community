import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { courseService } from '@/lib/courses/course-service';
import { learningCourseService } from '@/lib/learning/learning-course-service';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateCourseItemListJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { CourseView } from '@/components/courses/CourseView';
import { CourseSkeleton } from '@/components/courses/CourseSkeleton';
import type { CourseDetailResponse } from '@/types/course';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getCourseData(slug: string): Promise<{
  seriesDetail: CourseDetailResponse;
  presentation?: { estimatedDurationMinutes: number | null; learningOutcomes: string[] };
} | null> {
  try {
    const path = await learningCourseService.getPath(slug);
    if (path && path.series) {
      return {
        seriesDetail: {
          series: {
            id: path.series.id,
            name: path.series.title,
            slug: path.series.slug,
            description: path.series.description,
            sortOrder: 0,
            createdAt: path.series.createdAt,
          },
          articles: (path.lessons || []).map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            status: 'PUBLISHED',
            publishedAt: null,
            viewCount: 0,
          })),
          meta: {
            page: 1,
            limit: Math.max(1, (path.lessons || []).length),
            totalItems: (path.lessons || []).length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
        presentation: {
          estimatedDurationMinutes: path.series.estimatedDurationMinutes,
          learningOutcomes: path.series.learningOutcomes || [],
        },
      };
    }
  } catch {
    // Fall back to legacy courseService
  }

  try {
    const seriesDetail = await courseService.getBySlug(slug, { page: 1, limit: 20 });
    if (seriesDetail && seriesDetail.series) {
      return { seriesDetail };
    }
  } catch {
    // Both failed
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getCourseData(slug);
    if (!data) throw new Error('Not found');

    const title = `${data.seriesDetail.series.name} | Khóa học tài chính`;
    const description =
      data.seriesDetail.series.description ||
      'Khóa học thực tế được xây dựng theo lộ trình rõ ràng trên Finance Pulse.';
    const canonicalPath = `/khoa-hoc/${encodeURIComponent(slug)}`;

    return buildPageMetadata({
      title,
      description,
      canonicalPath,
      ogType: 'website',
      twitterCard: 'summary',
    });
  } catch {
    return buildPageMetadata({
      title: 'Không tìm thấy khóa học',
      noIndex: true,
    });
  }
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const courseData = await getCourseData(slug);

  if (!courseData || !courseData.seriesDetail) {
    notFound();
  }

  const { seriesDetail, presentation } = courseData;

  // Schema.org ItemList and Breadcrumbs JSON-LD
  const itemListJsonLd = generateCourseItemListJsonLd(seriesDetail);
  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Khóa học', url: '/khoa-hoc' },
    {
      name: seriesDetail.series.name,
      url: `/khoa-hoc/${encodeURIComponent(slug)}`,
    },
  ]);

  return (
    <>
      <JsonLd data={[itemListJsonLd, breadcrumbsJsonLd]} />
      <Suspense fallback={<CourseSkeleton variant="detail" />}>
        <CourseView initialData={seriesDetail} slug={slug} presentation={presentation} />
      </Suspense>
    </>
  );
}
