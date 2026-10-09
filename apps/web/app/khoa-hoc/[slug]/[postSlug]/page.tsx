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

const SERIES_ALIASES: Record<string, string> = {
  'quan-ly-tai-chinh-ca-nhan': 'tai-chinh-ca-nhan',
  'dau-tu-chung-khoan-tu-nen-tang': 'chung-khoan',
  'nhap-mon-chung-khoan-tu-nen-tang': 'chung-khoan',
  'quy-du-phong-va-bao-hiem': 'tai-chinh-ca-nhan',
  'doc-hieu-bao-cao-tai-chinh': 'chung-khoan',
  'lam-viec-hieu-qua-trong-thoi-dai-so': 'ky-nang-song',
  'suc-khoe-tai-chinh-va-the-chat': 'suc-khoe-co-ban',
  'ung-dung-ai-trong-cong-viec': 'tri-tue-nhan-tao',
  'giao-tiep-va-dam-phan': 'ky-nang-song',
};

async function getSeriesLesson(seriesSlug: string, postSlug: string) {
  const targetSeriesSlug = SERIES_ALIASES[seriesSlug] || seriesSlug;
  let seriesDetail: any = null;

  try {
    seriesDetail = await courseService.getBySlug(targetSeriesSlug, {
      page: 1,
      limit: 100,
    });
  } catch {
    if (targetSeriesSlug !== seriesSlug) {
      try {
        seriesDetail = await courseService.getBySlug(seriesSlug, { page: 1, limit: 100 });
      } catch {
        // failed
      }
    }
  }

  let post: any = null;
  try {
    post = await postsService.getBySlug('SERIES', postSlug);
  } catch {
    // try fallback post or null
  }

  if (post && post.status === 'PUBLISHED') {
    if (!seriesDetail) {
      seriesDetail = {
        series: {
          id: post.id,
          name: post.title,
          slug: seriesSlug,
          description: post.metaDescription,
          sortOrder: 0,
          createdAt: post.createdAt,
        },
        articles: [post],
        meta: { page: 1, limit: 1, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      };
    }
    return { seriesDetail, post };
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, postSlug } = await params;

  try {
    const result = await getSeriesLesson(slug, postSlug);
    if (!result) throw new Error('Lesson not found');

    const { post } = result;
    const coverMedia = post.coverMediaId
      ? post.media?.find((media: any) => media.id === post.coverMediaId)
      : post.media?.[0];
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
      tags: post.tags?.map((tag: any) => tag.name),
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
