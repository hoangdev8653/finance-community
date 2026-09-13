import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { courseService } from '@/lib/courses/course-service';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateCourseItemListJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { CourseView } from '@/components/courses/CourseView';
import { CourseSkeleton } from '@/components/courses/CourseSkeleton';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await courseService.getBySlug(slug, { page: 1, limit: 1 });
    const title = `${data.series.name} | Khóa học tài chính`;
    const description =
      data.series.description ||
      'Khóa học thực tế được xây dựng theo lộ trình rõ ràng trên BrewSeven.';
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

  let seriesDetail;
  try {
    seriesDetail = await courseService.getBySlug(slug, { page: 1, limit: 20 });
  } catch {
    notFound();
  }

  if (!seriesDetail || !seriesDetail.series) {
    notFound();
  }

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
        <CourseView initialData={seriesDetail} slug={slug} />
      </Suspense>
    </>
  );
}
