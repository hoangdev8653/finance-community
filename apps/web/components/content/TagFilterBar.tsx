'use client';

import React from 'react';
import { Tag as TagIcon, X } from 'lucide-react';
import { useTags } from '@/lib/posts/use-posts-feed';
import { cn } from '@/lib/utils/cn';

interface TagFilterBarProps {
  selectedTagId?: string;
  onSelectTag: (tagId?: string) => void;
}

const DEFAULT_TAGS = [
  { id: 'tag-investing', name: 'investing' },
  { id: 'tag-personal-finance', name: 'personal-finance' },
  { id: 'tag-stock-market', name: 'stock-market' },
  { id: 'tag-crypto', name: 'crypto' },
  { id: 'tag-valuation', name: 'valuation' },
  { id: 'tag-macroeconomics', name: 'macroeconomics' },
  { id: 'tag-derivatives', name: 'derivatives' },
];

export function TagFilterBar({ selectedTagId, onSelectTag }: TagFilterBarProps) {
  const { data: fetchedTags = [], isLoading } = useTags(undefined, 15);

  if (isLoading) {
    return null;
  }

  const tags = fetchedTags.length > 0 ? fetchedTags : DEFAULT_TAGS;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1" role="toolbar" aria-label="Filter by tag">
      <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono text-xs sm:text-sm mr-1 shrink-0 font-bold">
        <TagIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
              'inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full font-mono text-xs transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer whitespace-nowrap',
              isSelected
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-semibold hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <span>#{tag.name}</span>
            {isSelected && <X className="h-3.5 w-3.5 ml-0.5" />}
          </button>
        );
      })}
    </div>
  );
}
