import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { searchService } from '@/lib/search/search-service';

interface TagLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  let tagName = decodedSlug;
  try {
    const tags = await searchService.searchTags(decodedSlug, 1);
    if (tags && tags.length > 0 && tags[0].slug.toLowerCase() === decodedSlug.toLowerCase()) {
      tagName = tags[0].name;
    }
  } catch {
    // Graceful fallback to slug
    tagName = decodedSlug;
  }

  const title = `#${tagName} — Phân Tích & Nghiên Cứu Thị Trường`;
  const description = `Các bài viết nghiên cứu, phân tích tài chính và thảo luận chuyên sâu về chủ đề #${tagName} trên MorningView.`;
  const canonicalPath = `/tags/${encodeURIComponent(slug)}`;

  return buildPageMetadata({
    title,
    description,
    canonicalPath,
    ogType: 'website',
  });

}

export default function TagLayout({ children }: TagLayoutProps) {
  return <>{children}</>;
}
