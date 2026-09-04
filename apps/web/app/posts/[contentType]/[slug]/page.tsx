import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
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
      title: 'Không Tìm Thấy Bài Viết',
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
      'Phân tích tài chính chuyên sâu, mô hình định giá và thông tin thị trường trên MorningView.';
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
      title: 'Không Tìm Thấy Bài Viết',
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

  const domains = await postsService.getDomains().catch(() => []);
  const domain = post.domainId ? domains.find((item) => item.id === post.domainId) : undefined;
  if (domain) {
    permanentRedirect(`/${encodeURIComponent(domain.slug)}/bai-viet/${encodeURIComponent(post.slug)}`);
  }

  // Generate safe Schema.org Article & Breadcrumbs JSON-LD
  const articleJsonLd = generateArticleJsonLd(post);
  const sectionLabel = post.contentType === 'SERIES' ? 'Chuỗi Bài Học' : 'Cộng Đồng Phân Tích';
  const sectionUrl = post.contentType === 'SERIES' ? '/series' : '/posts';

  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    {
      name: sectionLabel,
      url: sectionUrl,
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
