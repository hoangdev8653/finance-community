'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Heart, MessageSquare, BookOpen, Clock, Bookmark, Check } from 'lucide-react';
import { PostEntity } from '@/types/content';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils/cn';

interface PostCardProps {
  post: PostEntity;
  categoryName?: string;
}

const EDITORIAL_THUMBNAILS = [
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
];

const MOCK_AUTHORS = [
  {
    name: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'Financial Analyst',
  },
  {
    name: 'Joan Names',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'Wealth Strategist',
  },
  {
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    role: 'Corporate Finance Lead',
  },
  {
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    role: 'Personal Finance Advisor',
  },
];

export function PostCard({ post, categoryName }: PostCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  const postHref = `/posts/${post.contentType.toLowerCase()}/${post.slug}`;
  
  // Pick author and image based on ID
  const charCode = (post.id.charCodeAt(post.id.length - 1) || 0) + (post.id.charCodeAt(0) || 0);
  const thumbnailUrl = EDITORIAL_THUMBNAILS[charCode % EDITORIAL_THUMBNAILS.length];
  const author = MOCK_AUTHORS[charCode % MOCK_AUTHORS.length];

  // Calculate estimated reading time (approx 200 wpm)
  const wordCount = (post.metaDescription?.split(/\s+/).length || 25) + 300;
  const readingMinutes = Math.max(3, Math.ceil(wordCount / 180));

  // Derived engagement metrics
  const likesCount = Math.max(1, (post.viewCount % 12) + 2);
  const commentsCount = Math.max(1, (post.viewCount % 6) + 1);

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(views >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`;
    }
    return views.toLocaleString();
  };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved((prev) => !prev);
  };

  return (
    <article className="group relative flex flex-col sm:flex-row items-stretch gap-5 sm:gap-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-xs">
      {/* Left Column: Visual Thumbnail with Next.js Image */}
      <Link
        href={postHref}
        tabIndex={-1}
        aria-hidden="true"
        className="relative shrink-0 w-full sm:w-60 md:w-68 lg:w-76 xl:w-80 h-48 sm:h-auto min-h-[160px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 group-hover:opacity-95 transition-opacity"
      >
        <Image
          src={thumbnailUrl}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 280px, 320px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
      </Link>

      {/* Right Column: Editorial Post Content & Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5 space-y-3">
        <div className="space-y-2.5">
          {/* Category & Topic Scope Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs sm:text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              {categoryName ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  {categoryName}
                </span>
              ) : (
                <Badge variant="outline" className="text-xs font-mono uppercase">
                  {post.contentType}
                </Badge>
              )}

              {post.contentType === 'SERIES' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/50">
                  <BookOpen className="h-3 w-3" />
                  Educational Series
                </span>
              )}

              {/* Reading time estimate */}
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-3 w-3" />
                {readingMinutes} min read
              </span>
            </div>

            {/* Quick Bookmark action */}
            <button
              onClick={handleSaveToggle}
              title={isSaved ? 'Saved to reading list' : 'Save for later'}
              className={cn(
                'inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors',
                isSaved
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
              aria-label="Bookmark article"
            >
              {isSaved ? (
                <Check className="h-4 w-4 stroke-2 text-blue-600 dark:text-blue-400" />
              ) : (
                <Bookmark className="h-4 w-4 stroke-[1.75]" />
              )}
            </button>
          </div>

          {/* Post Title — Elegant Editorial Typography */}
          <h2 className="line-clamp-2">
            <Link
              href={postHref}
              className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug"
            >
              {post.title}
            </Link>
          </h2>

          {/* Post Excerpt */}
          {post.metaDescription && (
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-normal">
              {post.metaDescription}
            </p>
          )}
        </div>

        {/* Footer: Author info & Engagement Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/90 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {/* Author Details */}
          <div className="flex items-center gap-2.5 min-w-0 font-medium">
            <Avatar
              src={author.avatar}
              fallback={author.name.slice(0, 2).toUpperCase()}
              size="sm"
              className="ring-1 ring-slate-200 dark:ring-slate-700 h-6 w-6 shrink-0"
            />
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
                {author.name}
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-xs">•</span>
              <time dateTime={post.publishedAt || post.createdAt} className="shrink-0 text-slate-500 dark:text-slate-400 text-xs">
                {formattedDate}
              </time>
            </div>
          </div>

          {/* Metrics: Views, Likes, Comments */}
          <div className="flex items-center gap-3.5 text-xs shrink-0 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors" title="Views">
              <Eye className="h-3.5 w-3.5" />
              <span>{formatViews(post.viewCount)}</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors" title="Applauds & Likes">
              <Heart className="h-3.5 w-3.5" />
              <span>{likesCount}</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors" title="Comments">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{commentsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
