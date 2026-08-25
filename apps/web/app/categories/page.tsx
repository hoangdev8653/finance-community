import React from 'react';
import { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import {
  generateCollectionPageJsonLd,
  generateBreadcrumbsJsonLd,
} from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { CategoriesDirectoryView } from '@/components/categories/CategoriesDirectoryView';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = buildPageMetadata({
  title: 'Danh Mục Chủ Đề & Lĩnh Vực Nghiên Cứu',
  description:
    'Khám phá các lĩnh vực nghiên cứu tài chính, danh mục kinh tế vĩ mô và chuỗi bài học chuyên ngành trên Finance Pulse.',
  canonicalPath: '/categories',
});

export default function CategoriesPage() {
  const collectionSchema = generateCollectionPageJsonLd(
    'Danh Mục Chủ Đề & Lĩnh Vực Nghiên Cứu',
    'Danh mục phân loại có cấu trúc về các lĩnh vực nghiên cứu tài chính và chuỗi bài học trên Finance Pulse.',
    '/categories'
  );

  const breadcrumbsSchema = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Danh Mục', url: '/categories' },
  ]);


  return (
    <AppShell>
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbsSchema} />
      <div className="space-y-6">
        <CategoriesDirectoryView />
      </div>
    </AppShell>
  );
}
