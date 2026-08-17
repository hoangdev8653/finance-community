import React from 'react';
import { Calendar, Eye, Clock, BookOpen } from 'lucide-react';
import { PostDetailResponse } from '@/types/content';
import { Badge } from '@/components/ui/Badge';
import { ReportButton } from '@/components/moderation/ReportButton';

interface PostHeaderProps {
  post: PostDetailResponse;
  categoryName?: string;
}

export function PostHeader({ post, categoryName }: PostHeaderProps) {
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

  // Calculate deterministic reading time (approx 225 words/min)
  const calculateReadingTime = (text: string | null): string => {
    if (!text) return '1 min read';
    const plainText = text.replace(/<[^>]*>/g, ' ');
    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 225));
    return `${minutes} min read`;
  };

  const readingTime = calculateReadingTime(post.body);
  const shortAuthor = post.authorId.slice(0, 8);

  return (
    <header className="space-y-4 pb-6 border-b border-border">
      {/* Category & Scope Badges + Report Action */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {categoryName && (
            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
              {categoryName}
            </Badge>
          )}

          <Badge variant="outline" className="text-xs font-mono uppercase px-2 py-0.5">
            {post.contentType}
          </Badge>

          {post.contentType === 'SERIES' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-primary uppercase font-bold tracking-wider">
              <BookOpen className="h-3.5 w-3.5" />
              Curated Curriculum
            </span>
          )}
        </div>

        {/* Report Post Trigger */}
        <ReportButton
          targetType="POST"
          targetId={post.id}
          targetTitle={post.title}
          variant="text"
        />
      </div>

      {/* Main Title */}
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
        {post.title}
      </h1>

      {/* Executive Summary / Meta Description Callout */}
      {post.metaDescription && (
        <div className="border-l-2 border-primary bg-muted/30 p-4 rounded-r-md">
          <p className="text-sm sm:text-base text-foreground/90 font-sans italic leading-relaxed">
            {post.metaDescription}
          </p>
        </div>
      )}

      {/* Author Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-3">
          <span className="bg-muted px-2 py-1 rounded text-foreground font-medium">
            Analyst #{shortAuthor}
          </span>

          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={post.publishedAt || post.createdAt}>{formattedDate}</time>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{readingTime}</span>
          </div>

          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{post.viewCount.toLocaleString()} views</span>
          </div>
        </div>
      </div>
    </header>
  );
}
