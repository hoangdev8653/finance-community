import React from 'react';
import Link from 'next/link';
import { Tag as TagIcon } from 'lucide-react';
import { PostTagItem } from '@/types/content';

interface PostTagsListProps {
  tags: PostTagItem[];
}

export function PostTagsList({ tags }: PostTagsListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="pt-6 border-t border-border mt-10">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1 mr-1">
          <TagIcon className="h-3.5 w-3.5" />
          Topics:
        </span>

        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/?tag=${encodeURIComponent(tag.id)}`}
            className="inline-flex items-center px-2.5 py-1 rounded-sm bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 font-mono text-xs transition-colors"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
