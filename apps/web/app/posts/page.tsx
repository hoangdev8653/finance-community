import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import {
  generateCollectionPageJsonLd,
  generateBreadcrumbsJsonLd,
} from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { PostsExplorerView } from '@/components/posts/PostsExplorerView';
import { PostCardSkeleton } from '@/components/content/PostCardSkeleton';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = buildPageMetadata({
  title: 'Kho Phân Tích & Nghiên Cứu Tài Chính',
  description:
    'Tra cứu, chọn lọc và đón đọc các bài phân tích kinh tế vĩ mô, định giá cổ phiếu và giáo trình đầu tư chuyên sâu trên Finance Pulse.',
  canonicalPath: '/posts',
});

export default function PostsPage() {
  const collectionSchema = generateCollectionPageJsonLd(
    'Kho Nghiên Cứu Tài Chính',
    'Kho lưu trữ toàn diện các bài phân tích tài chính cộng đồng, nhận định thị trường và chuỗi bài học chuyên ngành.',
    '/posts'
  );

  const breadcrumbsSchema = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Kho Phân Tích', url: '/posts' },
  ]);


  return (
    <AppShell>
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbsSchema} />
      <div className="space-y-6">
        <Suspense
          fallback={
            <div className="space-y-4">
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          }
        >
          <PostsExplorerView />
        </Suspense>
      </div>
    </AppShell>
  );
}
