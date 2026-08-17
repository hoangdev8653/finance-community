import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { seriesService } from '@/lib/series/series-service';
import { SeriesItem } from '@/types/series';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateCollectionPageJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { SeriesGrid } from '@/components/series/SeriesGrid';
import { SeriesSkeleton } from '@/components/series/SeriesSkeleton';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = buildPageMetadata({
  title: 'Educational Series & Curriculums',
  description:
    'Explore curated institutional financial research curricula, valuation masterclasses, and macroeconomic tracks.',
  canonicalPath: '/series',
  ogType: 'website',
  twitterCard: 'summary',
});

export default async function SeriesPage() {
  let seriesList: SeriesItem[] = [];
  try {
    const result = await seriesService.getAllSeries({ page: 1, limit: 50 });
    seriesList = result.data;
  } catch {
    seriesList = [];
  }

  const collectionJsonLd = generateCollectionPageJsonLd(
    'Educational Series & Curriculums',
    'Explore curated institutional financial research curricula, valuation masterclasses, and macroeconomic tracks on Finance Pulse.',
    '/series'
  );

  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Educational Series', url: '/series' },
  ]);

  return (
    <div className="space-y-8">
      <JsonLd data={[collectionJsonLd, breadcrumbsJsonLd]} />

      {/* Page Header */}
      <div className="space-y-2 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-primary font-medium">
          <BookOpen className="h-4 w-4" />
          <span className="uppercase tracking-widest">Educational Tracks</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          Curated Research Series
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Deep-dive, multi-part investment research curricula structured into comprehensive chapters.
        </p>
      </div>

      {/* Series Grid */}
      <Suspense fallback={<SeriesSkeleton variant="grid" />}>
        <SeriesGrid series={seriesList} />
      </Suspense>
    </div>
  );
}
