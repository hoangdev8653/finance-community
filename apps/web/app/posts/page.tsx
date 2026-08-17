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
    <>
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbsSchema} />
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-10">
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
    </>
  );
}
