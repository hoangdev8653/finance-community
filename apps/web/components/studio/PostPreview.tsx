'use client';

import React from 'react';
import { PostContentRenderer } from '@/components/content/PostContentRenderer';
import { Badge } from '@/components/ui/Badge';
import { Calendar, User } from 'lucide-react';

interface PostPreviewProps {
  title: string;
  contentType: 'SERIES' | 'COMMUNITY';
  categoryName?: string;
  tags: string[];
  body: string;
  authorName?: string;
}

export function PostPreview({
  title,
  contentType,
  categoryName,
  tags,
  body,
  authorName = 'Current Analyst',
}: PostPreviewProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="rounded-lg border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-2xs">
      {/* Scope & Category badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant={contentType === 'SERIES' ? 'default' : 'outline'}
          className="font-mono text-2xs uppercase"
        >
          {contentType}
        </Badge>
        {categoryName && (
          <span className="text-xs font-mono text-primary font-medium">
            {categoryName}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
        {title || 'Untitled Financial Analysis'}
      </h1>

      {/* Meta Bar */}
      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground border-b border-border pb-4">
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          <span>{authorName}</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Body Renderer */}
      <div className="pt-2">
        <PostContentRenderer body={body || '<p><em>No content written yet.</em></p>'} />
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="pt-6 border-t border-border flex items-center gap-1.5 flex-wrap">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="font-mono text-2xs py-0.5">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}
