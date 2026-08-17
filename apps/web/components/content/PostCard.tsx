import React from 'react';
import Link from 'next/link';
import { Eye, Calendar, BookOpen, MessageSquare } from 'lucide-react';
import { PostEntity } from '@/types/content';
import { Badge } from '@/components/ui/Badge';

interface PostCardProps {
  post: PostEntity;
  categoryName?: string;
}

export function PostCard({ post, categoryName }: PostCardProps) {
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
  const shortAuthor = post.authorId.slice(0, 8);

  return (
    <article className="group rounded-lg border border-border bg-surface p-5 hover:border-primary/40 transition-colors shadow-2xs">
      {/* Category & Content Type Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {categoryName ? (
            <Badge variant="secondary" className="text-xs font-medium">
              {categoryName}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs font-mono uppercase">
              {post.contentType}
            </Badge>
          )}

          {post.contentType === 'SERIES' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-primary uppercase tracking-wider font-semibold">
              <BookOpen className="h-3 w-3" />
              Series
            </span>
          )}
        </div>

        {/* View Count */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{post.viewCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Post Title */}
      <h2 className="mb-2">
        <Link
          href={postHref}
          className="font-serif text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug"
        >
          {post.title}
        </Link>
      </h2>

      {/* Post Excerpt / Meta Description */}
      {post.metaDescription && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {post.metaDescription}
        </p>
      )}

      {/* Card Footer: Author & Timestamp */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground/80">
            Analyst #{shortAuthor}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <Calendar className="h-3 w-3" aria-hidden="true" />
          <time dateTime={post.publishedAt || post.createdAt}>{formattedDate}</time>
        </div>
      </div>
    </article>
  );
}
