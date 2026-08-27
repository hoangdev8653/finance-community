import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { postsService } from '@/lib/posts/posts-service';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateArticleJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { PostDetailView } from '@/components/content/PostDetailView';
import { PostDetailSkeleton } from '@/components/content/PostDetailSkeleton';

interface DomainPostPageProps {
  params: Promise<{ domainSlug: string; postSlug: string }>;
}

async function loadPost(domainSlug: string, postSlug: string) {
  try {
    return await postsService.getByDomainSlug(domainSlug, postSlug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: DomainPostPageProps): Promise<Metadata> {
  const { domainSlug, postSlug } = await params;
  const post = await loadPost(domainSlug, postSlug);
  if (!post) return buildPageMetadata({ title: 'Post not found', noIndex: true });
  return buildPageMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.title,
    canonicalPath: `/${domainSlug}/bai-viet/${encodeURIComponent(postSlug)}`,
    ogType: 'article',
    publishedTime: post.publishedAt || post.createdAt,
    modifiedTime: post.updatedAt,
    tags: post.tags?.map((tag) => tag.name),
  });
}

export default async function DomainPostPage({ params }: DomainPostPageProps) {
  const { domainSlug, postSlug } = await params;
  const post = await loadPost(domainSlug, postSlug);
  if (!post || post.status !== 'PUBLISHED') notFound();

  const breadcrumbs = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: domainSlug, url: `/${domainSlug}` },
    { name: post.title, url: `/${domainSlug}/bai-viet/${encodeURIComponent(postSlug)}` },
  ]);

  return (
    <>
      <JsonLd data={[generateArticleJsonLd(post, `/${domainSlug}/bai-viet/${encodeURIComponent(postSlug)}`), breadcrumbs]} />
      <Suspense fallback={<PostDetailSkeleton />}>
        <PostDetailView initialPost={post} />
      </Suspense>
    </>
  );
}
