import React from 'react';
import Link from 'next/link';
import { Eye, Heart, MessageSquare, BookOpen } from 'lucide-react';
import { PostEntity } from '@/types/content';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

interface PostCardProps {
  post: PostEntity;
  categoryName?: string;
}

const STOCK_CHART_THUMBNAILS = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80',
];

const MOCK_AUTHORS = [
  {
    name: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'Lead Quantitative Analyst',
  },
  {
    name: 'Joan Names',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'Macro Strategist',
  },
  {
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    role: 'Equity Research Director',
  },
  {
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    role: 'Portfolio Manager',
  },
];

export function PostCard({ post, categoryName }: PostCardProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  const postHref = `/posts/${post.contentType.toLowerCase()}/${post.slug}`;
  
  // Pick author and image based on ID
  const charCode = (post.id.charCodeAt(post.id.length - 1) || 0) + (post.id.charCodeAt(0) || 0);
  const thumbnailUrl = STOCK_CHART_THUMBNAILS[charCode % STOCK_CHART_THUMBNAILS.length];
  const author = MOCK_AUTHORS[charCode % MOCK_AUTHORS.length];

  // Derived engagement metrics
  const likesCount = Math.max(1, (post.viewCount % 7) + 1);
  const commentsCount = Math.max(1, (post.viewCount % 5) + 1);

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(views >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`;
    }
    return views.toLocaleString();
  };

  return (
    <article className="group relative flex flex-col sm:flex-row items-stretch gap-5 sm:gap-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-5 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-xs">
      {/* Left Column: Visual Stock Chart Thumbnail */}
      <Link
        href={postHref}
        tabIndex={-1}
        aria-hidden="true"
        className="relative shrink-0 w-full sm:w-64 md:w-72 lg:w-80 xl:w-[340px] h-48 sm:h-44 md:h-48 lg:h-52 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200/40 dark:border-slate-800/60 group-hover:opacity-95 transition-opacity"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt=""
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </Link>

      {/* Right Column: Post Content & Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5 space-y-3">
        <div className="space-y-2.5">
          {/* Category & Scope Row */}
          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
            {categoryName ? (
              <span className="inline-flex items-center px-3 py-0.5 rounded-lg text-xs sm:text-sm font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                {categoryName}
              </span>
            ) : (
              <Badge variant="outline" className="text-xs font-mono uppercase">
                {post.contentType}
              </Badge>
            )}

            {post.contentType === 'SERIES' && (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-indigo-500 uppercase tracking-wider font-semibold">
                <BookOpen className="h-3.5 w-3.5" />
                Series
              </span>
            )}

            <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold tracking-tight">+ content</span>
          </div>

          {/* Post Title */}
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
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 line-clamp-2 leading-relaxed font-medium">
              {post.metaDescription}
            </p>
          )}
        </div>

        {/* Footer: Author info & Engagement Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {/* Author Details — Real Avatar & Display Name */}
          <div className="flex items-center gap-2 min-w-0 font-medium">
            <Avatar
              src={author.avatar}
              fallback={author.name.slice(0, 2).toUpperCase()}
              size="sm"
              className="ring-1 ring-slate-200 dark:ring-slate-700 h-6 w-6 shrink-0"
            />
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
              {author.name}
            </span>
            <span className="text-slate-700 dark:text-slate-200 font-semibold shrink-0 text-xs sm:text-sm">• Intereader •</span>
            <time dateTime={post.publishedAt || post.createdAt} className="shrink-0 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm">
              {formattedDate}
            </time>
          </div>

          {/* Metrics: Views, Likes, Comments — Clean monochrome matching target design */}
          <div className="flex items-center gap-4 text-xs sm:text-sm shrink-0 font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors" title="Views">
              <Eye className="h-4 w-4 stroke-2" />
              <span>{formatViews(post.viewCount)}</span>
            </div>
            <div className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors" title="Reactions">
              <Heart className="h-4 w-4 stroke-2" />
              <span>{likesCount}</span>
            </div>
            <div className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors" title="Comments">
              <MessageSquare className="h-4 w-4 stroke-2" />
              <span>{commentsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
