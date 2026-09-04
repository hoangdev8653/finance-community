import React from 'react';
import { Calendar, Eye, Clock } from 'lucide-react';
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
  const shortAuthor = post.authorId.slice(0, 8);

  return (
    <header className="space-y-4 pb-6 border-b border-border">
      {/* Category & Scope Badges + Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {categoryName && (
            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
              {categoryName}
            </Badge>
          )}

          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
            {post.contentType}
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
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {post.title}
        </h1>

        {post.metaDescription && (
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {post.metaDescription}
          </p>
        )}
      </div>

      {/* Author Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-3">
          <span className="bg-muted px-2 py-1 rounded text-foreground font-medium">
            Analyst #{shortAuthor}
          </span>

          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={post.publishedAt || post.createdAt} suppressHydrationWarning>{formattedDate}</time>
          </div>
        </div>

        <div className="flex items-center gap-4">
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
