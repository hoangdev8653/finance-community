import React from 'react';
import Link from 'next/link';
import { Tag as TagIcon } from 'lucide-react';
import { PostTagItem } from '@/types/content';

interface PostTagsListProps {
  tags: PostTagItem[];
}

const VISIBLE_POST_TAG_COUNT = 4;

export function PostTagsList({ tags }: PostTagsListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const visibleTags = tags.slice(0, VISIBLE_POST_TAG_COUNT);
  const hiddenTagCount = tags.length - visibleTags.length;

  return (
    <div className="pt-6 border-t border-border mt-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <TagIcon className="h-3.5 w-3.5" />
          Chủ đề:
        </span>

        {visibleTags.map((tag) => (
          <Link
            key={tag.id}
            href={`/?tag=${encodeURIComponent(tag.id)}`}
            className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            #{tag.name}
          </Link>
        ))}

        {hiddenTagCount > 0 && (
          <span className="text-xs font-mono text-muted-foreground">
            +{hiddenTagCount} thẻ
          </span>
        )}
      </div>
    </div>
  );
}
