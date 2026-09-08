'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { FeedList } from '@/components/content/FeedList';
import { postsService } from '@/lib/posts/posts-service';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Folder, BookOpen, Loader2, Sparkles } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';

interface CategoryDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams.slug;
  const decodedSlug = decodeURIComponent(rawSlug);
  const [contentType, setContentType] = useState<'ALL' | 'SERIES' | 'COMMUNITY'>('ALL');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => postsService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const currentCategory = categories.find(
    (c) =>
      c.slug === decodedSlug ||
      c.id === decodedSlug ||
      c.name.toLowerCase() === decodedSlug.toLowerCase()
  );

  const displayName = currentCategory
    ? currentCategory.name
    : decodedSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

  const displayDescription = currentCategory?.description ||
    `Tất cả các bài nghiên cứu chuyên sâu, bài học thực tế và nhận định thuộc chuyên mục ${displayName} trên ${BRAND.name}.`;

  const isSeriesScope = currentCategory?.scope === 'SERIES';

  return (
    <AppShell mainClassName="max-w-5xl">
      <div className="space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2">
          <Link href="/danh-muc">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Tất cả Danh mục</span>
            </Button>
          </Link>
        </div>

        {/* Category Hero Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                {isSeriesScope ? <BookOpen className="h-6 w-6" /> : <Folder className="h-6 w-6" />}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Chuyên mục
                  </span>
                  {currentCategory?.scope && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {currentCategory.scope === 'SERIES' ? 'Giáo trình Series' : 'Cộng đồng thảo luận'}
                    </span>
                  )}
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                  {displayName}
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {displayDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setContentType('ALL')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                contentType === 'ALL'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800'
              }`}
            >
              Tất cả ấn phẩm
            </button>
            <button
              type="button"
              onClick={() => setContentType('SERIES')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                contentType === 'SERIES'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800'
              }`}
            >
              Series bài học
            </button>
            <button
              type="button"
              onClick={() => setContentType('COMMUNITY')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                contentType === 'COMMUNITY'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800'
              }`}
            >
              Bài viết cộng đồng
            </button>
          </div>
        </div>

        {/* Content Feed List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <FeedList
            categoryId={currentCategory?.id}
            contentType={contentType === 'ALL' ? undefined : contentType}
            onResetFilters={() => setContentType('ALL')}
          />
        )}
      </div>
    </AppShell>
  );
}
