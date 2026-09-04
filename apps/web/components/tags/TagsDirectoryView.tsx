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
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-3 py-1 rounded-md font-mono">
            <Tag className="h-3.5 w-3.5" />
            <span>Hệ thống Chủ đề Thị trường</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100">
            Chủ đề & Từ khóa Tài chính Thịnh hành
          </h1>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed font-normal">
            Khám phá các phân lớp tài sản, mã cổ phiếu doanh nghiệp, và xu hướng kinh tế vĩ mô được quan tâm nhiều nhất trong các bài phân tích.
          </p>
        </div>

        {/* Live Filter Input */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm chủ đề theo từ khóa hoặc mã cổ phiếu (FPT, HPG, Fed...)..."
            aria-label="Lọc chủ đề"
            className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 shadow-2xs transition-colors"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <TagsSkeleton />}

      {/* Error State */}
      {isError && (
        <ErrorState
          title="Không thể nạp danh sách chủ đề"
          message={error instanceof Error ? error.message : 'Đã có lỗi xảy ra trong quá trình nạp dữ liệu.'}
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
                <Flame className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                <h2 id="popular-tags-heading" className="text-sm font-bold uppercase tracking-wider text-slate-950 dark:text-slate-100 font-heading">
                  Chủ đề Nổi bật & Phổ biến
                </h2>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {popularTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${encodeURIComponent(tag.slug)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 transition-all hover:border-emerald-500 hover:bg-emerald-50/60 dark:hover:bg-slate-700 hover:text-emerald-950 dark:hover:text-emerald-300 shadow-2xs"
                  >
                    <Hash className="h-3.5 w-3.5 text-slate-500" />
                    <span>{tag.name}</span>
                    <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
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
              title={searchQuery.trim() ? `Không có chủ đề phù hợp với "${searchQuery}"` : 'Chưa có chủ đề'}
              description={
                searchQuery.trim()
                  ? 'Hãy thử từ khóa khác hoặc xóa nội dung tìm kiếm.'
                  : 'Hiện chưa có chủ đề nào trong hệ thống.'
              }
              actionLabel={searchQuery.trim() ? 'Xóa bộ lọc' : undefined}
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
                      ({groupedTags[letter].length} chủ đề)
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
