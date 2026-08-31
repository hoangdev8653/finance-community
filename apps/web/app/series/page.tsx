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
  title: 'Chuỗi Bài Học & Kiến Thức Thực Tế',
  description:
    'Khám phá các chuỗi bài học thực tế về tài chính, sức khỏe, kỹ năng sống, công việc và nhiều chủ đề hữu ích khác.',
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
    'Chuỗi Bài Học & Kiến Thức Thực Tế',
    'Khám phá các chuỗi bài học thực tế được tổ chức theo chủ đề và lộ trình dễ học.',
    '/series'
  );

  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Chuỗi Bài Học', url: '/series' },
  ]);

  return (
    <AppShell>
      <div className="space-y-8">
        <JsonLd data={[collectionJsonLd, breadcrumbsJsonLd]} />

        {/* Page Header */}
        <PageHeader
          icon={BookOpen}
          label="Học theo lộ trình"
          title="Kiến thức thực tế, học dễ hiểu"
          subtitle="Các series ngắn được cấu trúc thành từng bài học, ví dụ và hoạt động luyện tập để bạn học và áp dụng từng bước."
        />


        {/* Series Grid */}
        <Suspense fallback={<SeriesSkeleton variant="grid" />}>
          <SeriesGrid series={seriesList} />
        </Suspense>
      </div>
    </AppShell>
  );
}
