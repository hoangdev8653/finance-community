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
  title: 'Research Archives & Financial Analyses',
  description:
    'Search, filter, and read through institutional macroeconomic research, equity valuation models, and educational curriculums on Finance Pulse.',
  canonicalPath: '/posts',
});

export default function PostsPage() {
  const collectionSchema = generateCollectionPageJsonLd(
    'Financial Research Archives',
    'Complete repository of published community financial analyses, market insights, and educational series tracks.',
    '/posts'
  );

  const breadcrumbsSchema = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Research Archives', url: '/posts' },
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
