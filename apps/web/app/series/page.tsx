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
  title: 'Chuỗi Bài Học & Giáo Trình Đầu Tư',
  description:
    'Khám phá các chuỗi bài học tài chính chọn lọc, khóa học định giá doanh nghiệp và lộ trình đầu tư từ cơ bản đến chuyên sâu trên Finance Pulse.',
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
    'Chuỗi Bài Học & Giáo Trình Đầu Tư',
    'Khám phá các chuỗi bài học tài chính chọn lọc, khóa học định giá doanh nghiệp và lộ trình đầu tư trên Finance Pulse.',
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
          label="Giáo trình Đào tạo"
          title="Chuỗi Bài Phân Tích Chọn Lọc"
          subtitle="Giáo trình nghiên cứu đầu tư chuyên sâu, được cấu trúc mạch lạc thành từng chương bài học dễ tiếp cận."
        />


        {/* Series Grid */}
        <Suspense fallback={<SeriesSkeleton variant="grid" />}>
          <SeriesGrid series={seriesList} />
        </Suspense>
      </div>
    </AppShell>
  );
}
