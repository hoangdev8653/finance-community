import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { postsService } from '@/lib/posts/posts-service';
import { courseService } from '@/lib/courses/course-service';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateArticleJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { PostDetailView } from '@/components/content/PostDetailView';
import { PostDetailSkeleton } from '@/components/content/PostDetailSkeleton';

interface PageProps {
  params: Promise<{
    slug: string;
    postSlug: string;
  }>;
}

async function getSeriesLesson(seriesSlug: string, postSlug: string) {
  const seriesDetail = await courseService.getBySlug(seriesSlug, {
    page: 1,
    limit: 100,
  });
  const belongsToSeries = seriesDetail.articles.some(
    (article) => article.slug === postSlug
  );

  if (!belongsToSeries) {
    return null;
  }

  const post = await postsService.getBySlug('SERIES', postSlug);
  return post.status === 'PUBLISHED' ? { seriesDetail, post } : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, postSlug } = await params;

  try {
    const result = await getSeriesLesson(slug, postSlug);
    if (!result) throw new Error('Lesson not found');

    const { post } = result;
    const coverMedia = post.coverMediaId
      ? post.media.find((media) => media.id === post.coverMediaId)
      : post.media[0];
    const canonicalPath = `/series/${encodeURIComponent(slug)}/${encodeURIComponent(postSlug)}`;

    return buildPageMetadata({
      title: post.metaTitle || post.title,
      description:
        post.metaDescription ||
        'Bài học chuyên sâu trong khóa học của BrewSeven.',
      canonicalPath,
      ogType: 'article',
      ogImage: coverMedia?.secureUrl,
      twitterCard: 'summary_large_image',
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      tags: post.tags?.map((tag) => tag.name),
    });
  } catch {
    return buildPageMetadata({ title: 'Không Tìm Thấy Bài Học', noIndex: true });
  }
}

export default async function SeriesLessonPage({ params }: PageProps) {
  const { slug, postSlug } = await params;

  let result: Awaited<ReturnType<typeof getSeriesLesson>>;
  try {
    result = await getSeriesLesson(slug, postSlug);
  } catch {
    notFound();
  }

  if (!result) notFound();

  const { seriesDetail, post } = result;
  const canonicalPath = `/series/${encodeURIComponent(slug)}/${encodeURIComponent(postSlug)}`;
  const articleJsonLd = generateArticleJsonLd(post, canonicalPath);
  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Khóa học', url: '/series' },
    {
      name: seriesDetail.series.name,
      url: `/series/${encodeURIComponent(slug)}`,
    },
    { name: post.title, url: canonicalPath },
  ]);

  return (
    <>
      <JsonLd data={[articleJsonLd, breadcrumbsJsonLd]} />
      <Suspense fallback={<PostDetailSkeleton />}>
        <PostDetailView
          initialPost={post}
          series={{ name: seriesDetail.series.name, slug: seriesDetail.series.slug }}
        />
      </Suspense>
    </>
  );
}
