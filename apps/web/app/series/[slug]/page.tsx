import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { seriesService } from '@/lib/series/series-service';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateSeriesItemListJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { SeriesView } from '@/components/series/SeriesView';
import { SeriesSkeleton } from '@/components/series/SeriesSkeleton';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await seriesService.getBySlug(slug, { page: 1, limit: 1 });
    const title = `${data.series.name} | Chuỗi Bài Học Tài Chính`;
    const description =
      data.series.description ||
      'Chuỗi bài học thực tế được xây dựng theo lộ trình rõ ràng trên Finance Community.';
    const canonicalPath = `/series/${encodeURIComponent(slug)}`;

    return buildPageMetadata({
      title,
      description,
      canonicalPath,
      ogType: 'website',
      twitterCard: 'summary',
    });
  } catch {
    return buildPageMetadata({
      title: 'Không Tìm Thấy Chuỗi Bài Học',
      noIndex: true,
    });
  }
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let seriesDetail;
  try {
    seriesDetail = await seriesService.getBySlug(slug, { page: 1, limit: 20 });
  } catch {
    notFound();
  }

  if (!seriesDetail || !seriesDetail.series) {
    notFound();
  }

  // Schema.org ItemList and Breadcrumbs JSON-LD
  const itemListJsonLd = generateSeriesItemListJsonLd(seriesDetail);
  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Chuỗi Bài Học', url: '/series' },
    {
      name: seriesDetail.series.name,
      url: `/series/${encodeURIComponent(slug)}`,
    },
  ]);


  return (
    <>
      <JsonLd data={[itemListJsonLd, breadcrumbsJsonLd]} />
      <Suspense fallback={<SeriesSkeleton variant="detail" />}>
        <SeriesView initialData={seriesDetail} slug={slug} />
      </Suspense>
    </>
  );
}
