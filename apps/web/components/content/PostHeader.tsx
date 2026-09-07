import React from 'react';
import { Calendar, Eye, Clock, BookOpen } from 'lucide-react';
import { PostDetailResponse } from '@/types/content';
import { Badge } from '@/components/ui/Badge';
import { ReportButton } from '@/components/moderation/ReportButton';
import { formatDate } from '@/lib/utils/date';
import { calculateReadingTime } from '@/lib/utils/reading-time';
import { BookmarkButton } from './BookmarkButton';

interface PostHeaderProps {
  post: PostDetailResponse;
  categoryName?: string;
}

export function PostHeader({ post, categoryName }: PostHeaderProps) {
  const formattedDate = formatDate(post.publishedAt || post.createdAt);
  const readingTime = calculateReadingTime(post.body);
  const authorName = post.author?.displayName || post.author?.username || 'Ban Biên Tập BrewSeven';
  const contentLabel = post.contentType === 'COMMUNITY' ? 'Cộng đồng' : 'Series';

  return (
    <header className="space-y-6">
      {/* Category & Scope Badges + Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {categoryName && (
            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
              {categoryName}
            </Badge>
          )}

          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 px-2.5 py-0.5 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            {contentLabel}
          </Badge>
        </div>

        {/* Action Controls: Bookmark & Report */}
        <div className="flex items-center gap-2">
          <BookmarkButton postId={post.id} variant="pill" size="sm" />
          <ReportButton
            targetType="POST"
            targetId={post.id}
            targetTitle={post.title}
            variant="text"
            className="text-xs text-muted-foreground hover:text-danger"
          />
        </div>
      </div>

      {/* Main Title & Executive Description */}
      <div className="space-y-4">
        <h1 className="font-heading text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[46px]">
          {post.title}
        </h1>

        {post.metaDescription && (
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {post.metaDescription}
          </p>
        )}
      </div>

      {/* Author Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5 text-xs text-muted-foreground dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-foreground dark:bg-slate-800">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            {authorName}
          </span>

          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={post.publishedAt || post.createdAt} suppressHydrationWarning>{formattedDate}</time>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{readingTime}</span>
          </div>

          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{post.viewCount.toLocaleString('vi-VN')} lượt xem</span>
          </div>
        </div>
      </div>
    </header>
  );
}
