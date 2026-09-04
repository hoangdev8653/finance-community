'use client';

import React from 'react';
import { Bookmark } from 'lucide-react';
import { usePostBookmark } from '@/lib/posts/use-post-bookmark';
import { cn } from '@/lib/utils/cn';

export interface BookmarkButtonProps {
  postId: string;
  variant?: 'icon' | 'labeled' | 'pill';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BookmarkButton({
  postId,
  variant = 'icon',
  className,
  size = 'md',
}: BookmarkButtonProps) {
  const { isBookmarked, isLoading, toggleBookmark } = usePostBookmark(postId);

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs gap-1.5',
    md: 'h-9 px-3 text-xs gap-2',
    lg: 'h-10 px-4 text-sm gap-2.5',
  }[size];

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-4 w-4',
  }[size];

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleBookmark();
        }}
        disabled={isLoading}
        aria-label={isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
        title={isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl border border-border p-2 transition-all duration-200 cursor-pointer',
          isBookmarked
            ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
            : 'bg-surface hover:bg-muted text-muted-foreground hover:text-foreground',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        <Bookmark
          className={cn(
            iconSizes,
            'transition-transform duration-200 active:scale-90',
            isBookmarked && 'fill-current'
          )}
        />
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleBookmark();
        }}
        disabled={isLoading}
        aria-label={isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
        className={cn(
          'inline-flex items-center rounded-full font-medium transition-all duration-200 cursor-pointer border',
          sizeClasses,
          isBookmarked
            ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 font-semibold'
            : 'bg-surface/80 border-border text-muted-foreground hover:text-foreground hover:bg-muted',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        <Bookmark
          className={cn(
            iconSizes,
            'shrink-0 transition-transform duration-200',
            isBookmarked && 'fill-current'
          )}
        />
        <span>{isBookmarked ? 'Đã lưu' : 'Lưu bài viết'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark();
      }}
      disabled={isLoading}
      aria-label={isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 cursor-pointer border shadow-xs',
        sizeClasses,
        isBookmarked
          ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/15 font-semibold'
          : 'bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-muted/60',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <Bookmark
        className={cn(
          iconSizes,
          'shrink-0 transition-transform duration-200',
          isBookmarked && 'fill-current'
        )}
      />
      <span>{isBookmarked ? 'Đã lưu' : 'Lưu bài'}</span>
    </button>
  );
}
