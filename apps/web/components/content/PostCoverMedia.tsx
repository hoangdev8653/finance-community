import React from 'react';
import { PostDetailResponse } from '@/types/content';

interface PostCoverMediaProps {
  post: PostDetailResponse;
  priority?: boolean;
}

export function PostCoverMedia({ post, priority = true }: PostCoverMediaProps) {
  // 1. Check coverMediaId match
  let coverMedia = post.coverMediaId
    ? post.media.find((m) => m.id === post.coverMediaId)
    : undefined;

  // 2. Check purpose === 'cover'
  if (!coverMedia) {
    coverMedia = post.media.find((m) => m.purpose === 'cover');
  }

  // 3. Fallback to first available media item
  if (!coverMedia && post.media.length > 0) {
    coverMedia = post.media[0];
  }

  if (!coverMedia || !coverMedia.secureUrl) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border bg-surface my-6 aspect-video sm:aspect-21/9 shadow-xs">
      <img
        src={coverMedia.secureUrl}
        alt={post.title}
        className="w-full h-full object-cover"
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}
