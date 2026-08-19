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
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';

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
    <AppShell>
      <div className="space-y-8">
        <JsonLd data={[collectionJsonLd, breadcrumbsJsonLd]} />

        {/* Page Header */}
        <PageHeader
          icon={BookOpen}
          label="Educational Tracks"
          title="Curated Research Series"
          subtitle="Deep-dive, multi-part investment research curricula structured into comprehensive chapters."
        />

        {/* Series Grid */}
        <Suspense fallback={<SeriesSkeleton variant="grid" />}>
          <SeriesGrid series={seriesList} />
        </Suspense>
      </div>
    </AppShell>
  );
}
