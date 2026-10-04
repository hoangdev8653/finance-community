import React from 'react';
import { Calendar, Eye, Clock } from 'lucide-react';
import { PostDetailResponse } from '@/types/content';
import { Badge } from '@/components/ui/Badge';
import { ReportButton } from '@/components/moderation/ReportButton';
import { formatDate } from '@/lib/utils/date';
import { calculateReadingTime } from '@/lib/utils/reading-time';

interface PostHeaderProps {
  post: PostDetailResponse;
  categoryName?: string;
}

export function PostHeader({ post, categoryName }: PostHeaderProps) {
  const isLesson = post.contentType === 'SERIES';
  const formattedDate = formatDate(post.publishedAt || post.createdAt);
  const readingTime = calculateReadingTime(post.body);
  const authorName = post.author?.displayName || post.author?.username || 'Ban Biên Tập BrewSeven';
  const authorAvatar = post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=10b981&color=fff&size=80`;

  return (
    <header className={isLesson ? 'space-y-4' : 'space-y-5'}>
      {!isLesson && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {categoryName && (
              <Badge variant="secondary" className="px-2.5 py-1 text-xs font-semibold">
                {categoryName}
              </Badge>
            )}
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              Cộng đồng
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <ReportButton targetType="POST" targetId={post.id} targetTitle={post.title} variant="text" className="text-xs text-muted-foreground hover:text-danger" />
          </div>
        </div>
      )}

      <div className={isLesson ? 'space-y-3' : 'space-y-3'}>
        <h1 className={`font-heading font-extrabold leading-[1.25] tracking-tight text-foreground ${isLesson ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-2xl sm:text-3xl lg:text-[34px]'}`}>
          {post.title}
        </h1>
        {post.metaDescription && (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {post.metaDescription}
          </p>
        )}
      </div>

      <div className={`flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground ${isLesson ? 'pt-1' : 'border-t border-border/60 pt-4'}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-border/80 shadow-2xs"
            />
            <span className="font-semibold text-foreground hover:text-primary transition-colors">
              {authorName}
            </span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={post.publishedAt || post.createdAt} suppressHydrationWarning>
              {formattedDate}
            </time>
          </div>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{readingTime}</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{post.viewCount.toLocaleString('vi-VN')} lượt xem</span>
          </div>
        </div>
      </div>
    </header>
  );
}
