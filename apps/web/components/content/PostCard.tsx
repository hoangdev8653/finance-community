'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostEntity } from '@/types/content';
import { resolveMediaUrl } from '@/lib/utils/media';
import { formatRelativeTime } from '@/lib/utils/date';
import { BookmarkButton } from './BookmarkButton';

interface PostCardProps {
  post: PostEntity;
  categoryName?: string;
}

function PostCardComponent({ post, categoryName }: PostCardProps) {
  const displayDate = post.publishedAt || post.createdAt;
  const timeLabel = formatRelativeTime(displayDate);
  const postHref = `/posts/${post.contentType.toLowerCase()}/${post.slug}`;

  // Cover image from post or default
  const coverUrl = resolveMediaUrl(post.coverMediaId);

  // Category label fallback
  const displayCategory = categoryName || (post.contentType === 'SERIES' ? 'Chuỗi bài Series' : 'Thị trường tài chính');

  return (
    <article className="group flex flex-col sm:flex-row items-start gap-4 sm:gap-6 py-5 border-b border-dashed border-slate-200 dark:border-[#253044] last:border-b-0 transition-colors">
      {/* Left Column: Soft Rounded 16:9 Thumbnail Image */}
      <Link
        href={postHref}
        tabIndex={-1}
        aria-hidden="true"
        className="relative shrink-0 w-full sm:w-56 md:w-64 lg:w-72 h-44 sm:h-36 md:h-40 lg:h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#162033] border border-slate-200/80 dark:border-[#253044] shadow-xs group-hover:opacity-95 transition-opacity"
      >
        <Image
          src={coverUrl}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 260px, 300px"
          className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
        />
      </Link>

      {/* Right Column: CafeF Style Editorial Content (Title -> Category - Time -> Excerpt) */}
      <div className="flex-1 min-w-0 space-y-2 pt-0.5 w-full">
        {/* 1. Article Headline */}
        <h2 className="line-clamp-2">
          <Link
            href={postHref}
            className="font-heading text-lg sm:text-xl lg:text-2xl font-bold text-slate-950 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-snug"
          >
            {post.title}
          </Link>
        </h2>

        {/* 2. Category, Relative Time & Bookmark Action */}
        <div className="flex items-center justify-between gap-2 text-sm font-semibold">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-teal-900 dark:text-teal-400 font-bold hover:underline cursor-pointer truncate">
              {displayCategory}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">-</span>
            <time dateTime={displayDate} suppressHydrationWarning className="text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm shrink-0">
              {timeLabel}
            </time>
          </div>
          <BookmarkButton postId={post.id} variant="icon" size="sm" className="shrink-0" />
        </div>

        {/* 3. Article Content Excerpt — Enlarged Font Size & High Contrast */}
        {post.metaDescription && (
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed font-normal pt-1">
            {post.metaDescription}
          </p>
        )}
      </div>
    </article>
  );
}

export const PostCard = React.memo(PostCardComponent);

