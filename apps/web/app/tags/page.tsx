import React from 'react';
import { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import {
  generateCollectionPageJsonLd,
  generateBreadcrumbsJsonLd,
} from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { TagsDirectoryView } from '@/components/tags/TagsDirectoryView';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = buildPageMetadata({
  title: 'Thư Mục Thẻ Chủ Đề & Mã Cổ Phiếu',
  description:
    'Tra cứu toàn bộ thẻ chủ đề tài chính, mã chứng khoán và từ khóa thị trường được phân loại trên MorningView.',
  canonicalPath: '/tags',
});

export default function TagsPage() {
  const collectionSchema = generateCollectionPageJsonLd(
    'Thư Mục Thẻ Chủ Đề & Mã Cổ Phiếu',
    'Danh mục thẻ phân loại thị trường, nhóm tài sản và chủ đề tài chính trên MorningView.',
    '/tags'
  );

  const breadcrumbsSchema = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Thẻ Chủ Đề', url: '/tags' },
  ]);


  return (
    <AppShell>
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbsSchema} />
      <div className="space-y-6">
        <TagsDirectoryView />
      </div>
    </AppShell>
  );
}
