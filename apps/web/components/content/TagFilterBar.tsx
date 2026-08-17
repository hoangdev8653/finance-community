'use client';

import React from 'react';
import { Tag as TagIcon, X } from 'lucide-react';
import { useTags } from '@/lib/posts/use-posts-feed';
import { cn } from '@/lib/utils/cn';

interface TagFilterBarProps {
  selectedTagId?: string;
  onSelectTag: (tagId?: string) => void;
}

export function TagFilterBar({ selectedTagId, onSelectTag }: TagFilterBarProps) {
  const { data: tags = [], isLoading } = useTags(undefined, 15);

  if (isLoading) {
    return null;
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs" role="toolbar" aria-label="Filter by tag">
      <span className="text-muted-foreground flex items-center gap-1 font-mono text-[11px] mr-1 shrink-0">
        <TagIcon className="h-3 w-3" />
        Tags:
      </span>

      {tags.map((tag) => {
        const isSelected = selectedTagId === tag.id;
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onSelectTag(isSelected ? undefined : tag.id)}
            aria-pressed={isSelected}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-sm font-mono text-[11px] transition-colors focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary',
              isSelected
                ? 'bg-secondary text-secondary-foreground font-semibold'
                : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <span>#{tag.name}</span>
            {isSelected && <X className="h-3 w-3 ml-0.5" />}
          </button>
        );
      })}
    </div>
  );
}
