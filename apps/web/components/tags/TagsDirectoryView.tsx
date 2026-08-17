'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Hash, Tag, Flame, RefreshCw } from 'lucide-react';
import { useTags } from '@/lib/posts/use-posts-feed';
import { TagEntity } from '@/types/content';
import { TagCard } from './TagCard';
import { TagsSkeleton } from './TagsSkeleton';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';

export function TagsDirectoryView() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tags = [], isLoading, isError, error, refetch } = useTags('', 100);

  // Filter tags based on client search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const query = searchQuery.toLowerCase().trim();
    return tags.filter(
      (t) => t.name.toLowerCase().includes(query) || t.slug.toLowerCase().includes(query)
    );
  }, [tags, searchQuery]);

  // Derive top 10 popular market tags by usageCount
  const popularTags = useMemo(() => {
    return [...tags]
      .filter((t) => t.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);
  }, [tags]);

  // Group filtered tags alphabetically
  const groupedTags = useMemo(() => {
    const groups: Record<string, TagEntity[]> = {};

    const sorted = [...filteredTags].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

    for (const tag of sorted) {
      const firstChar = tag.name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(tag);
    }

    return groups;
  }, [filteredTags]);

  const groupKeys = Object.keys(groupedTags).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-10">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            <Tag className="h-3.5 w-3.5" />
            <span>Market Taxonomy</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Market Tags & Research Topics
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Explore institutional market taxonomy, asset classes, corporate tickers, and macro trends cataloged across community analyses and series.
          </p>
        </div>

        {/* Live Filter Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter market tags by keyword or ticker..."
            aria-label="Filter market tags"
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <TagsSkeleton />}

      {/* Error State */}
      {isError && (
        <ErrorState
          title="Unable to load taxonomy tags"
          message={error instanceof Error ? error.message : 'An unexpected error occurred while fetching tags.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Content State */}
      {!isLoading && !isError && (
        <>
          {/* Popular Market Tags Section (only when no search filter active) */}
          {!searchQuery.trim() && popularTags.length > 0 && (
            <section className="space-y-3" aria-labelledby="popular-tags-heading">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h2 id="popular-tags-heading" className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Popular Market Tags
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${encodeURIComponent(tag.slug)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <span>{tag.name}</span>
                    <span className="ml-1 rounded-full bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
                      {tag.usageCount}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Empty Search Results */}
          {filteredTags.length === 0 ? (
            <EmptyState
              title={searchQuery.trim() ? `No tags matching "${searchQuery}"` : 'No market tags found'}
              description={
                searchQuery.trim()
                  ? 'Try searching for a different keyword, sector ticker, or clear the search input.'
                  : 'No taxonomy tags are currently cataloged in the system.'
              }
              actionLabel={searchQuery.trim() ? 'Clear Filter' : undefined}
              onAction={searchQuery.trim() ? () => setSearchQuery('') : undefined}
            />
          ) : (
            /* Grouped Alphabetical Grid */
            <div className="space-y-8">
              {groupKeys.map((letter) => (
                <section key={letter} aria-labelledby={`tag-group-${letter}`} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
                    <h2
                      id={`tag-group-${letter}`}
                      className="font-mono text-base font-bold text-primary"
                    >
                      {letter}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      ({groupedTags[letter].length} {groupedTags[letter].length === 1 ? 'tag' : 'tags'})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {groupedTags[letter].map((tag) => (
                      <TagCard key={tag.id} tag={tag} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
