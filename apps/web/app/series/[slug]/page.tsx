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
    const title = `${data.series.name} | Educational Series`;
    const description =
      data.series.description ||
      'Structured financial research and analytical curriculum on Finance Pulse.';
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
      title: 'Series Not Found',
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
    { name: 'Home', url: '/' },
    { name: 'Educational Series', url: '/series' },
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
