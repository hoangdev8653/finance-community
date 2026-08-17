import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { postsService } from '@/lib/posts/posts-service';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateArticleJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { PostDetailView } from '@/components/content/PostDetailView';
import { PostDetailSkeleton } from '@/components/content/PostDetailSkeleton';

interface PageProps {
  params: Promise<{
    contentType: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { contentType, slug } = await params;
  const normalizedType = contentType.toLowerCase();

  if (normalizedType !== 'community' && normalizedType !== 'series') {
    return buildPageMetadata({
      title: 'Article Not Found',
      noIndex: true,
    });
  }

  try {
    const post = await postsService.getBySlug(contentType.toUpperCase(), slug);
    const coverMedia = post.coverMediaId
      ? post.media.find((m) => m.id === post.coverMediaId)
      : post.media[0];

    const title = post.metaTitle || post.title;
    const description =
      post.metaDescription ||
      'In-depth financial analysis, valuation models, and market intelligence on Finance Pulse.';
    const canonicalPath = `/posts/${normalizedType}/${encodeURIComponent(slug)}`;

    return buildPageMetadata({
      title,
      description,
      canonicalPath,
      ogType: 'article',
      ogImage: coverMedia?.secureUrl,
      twitterCard: 'summary_large_image',
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      tags: post.tags?.map((t) => t.name),
    });
  } catch {
    return buildPageMetadata({
      title: 'Article Not Found',
      noIndex: true,
    });
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { contentType, slug } = await params;
  const normalizedType = contentType.toLowerCase();

  if (normalizedType !== 'community' && normalizedType !== 'series') {
    notFound();
  }

  let post;
  try {
    post = await postsService.getBySlug(contentType.toUpperCase(), slug);
  } catch {
    notFound();
  }

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  // Generate safe Schema.org Article & Breadcrumbs JSON-LD
  const articleJsonLd = generateArticleJsonLd(post);
  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    {
      name: post.contentType === 'SERIES' ? 'Educational Series' : 'Community Analyses',
      url: post.contentType === 'SERIES' ? '/series' : '/',
    },
    {
      name: post.title,
      url: `/posts/${normalizedType}/${encodeURIComponent(slug)}`,
    },
  ]);

  return (
    <>
      <JsonLd data={[articleJsonLd, breadcrumbsJsonLd]} />
      <Suspense fallback={<PostDetailSkeleton />}>
        <PostDetailView initialPost={post} />
      </Suspense>
    </>
  );
}
