'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useTagBySlug } from '@/lib/search/use-search';
import { SearchResultsList } from '@/components/search/SearchResultsList';
import { Tag, ArrowLeft, Loader2, BookOpen, Users, Sparkles } from 'lucide-react';

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function TagExplorePage({ params }: TagPageProps) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams.slug;
  const decodedSlug = decodeURIComponent(rawSlug);

  const { data: tag, isLoading, isError } = useTagBySlug(decodedSlug);
  const [page, setPage] = useState(1);
  const [contentType, setContentType] = useState<'ALL' | 'SERIES' | 'COMMUNITY'>('ALL');

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center space-y-3 px-4 py-16 sm:px-6">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-muted-foreground">Đang tải chủ đề…</p>
      </div>
    );
  }

  if (isError || !tag) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Tag className="h-6 w-6" /></span>
        <h1 className="mt-5 font-heading text-2xl font-bold text-slate-950 dark:text-white">Không tìm thấy chủ đề</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">Chủ đề này có thể đã được đổi tên hoặc không còn tồn tại.</p>
        <Link href="/the" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:bg-emerald-500 dark:text-slate-950"><ArrowLeft className="h-4 w-4" /> Xem tất cả chủ đề</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 px-3.5 py-2 sm:px-6 lg:px-8">
      <Link href="/tim-kiem" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-slate-300 dark:hover:text-emerald-300">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Quay lại tìm kiếm
      </Link>

      <header className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-teal-100/70 p-6 shadow-sm sm:p-8 dark:border-emerald-900/60 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950/40">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-700/15" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/15 dark:bg-emerald-500 dark:text-slate-950">
              <Tag className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-300">Khám phá chủ đề</p>
              <h1 className="mt-1 break-words font-heading text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">#{tag.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">Tìm các bài học và chia sẻ cộng đồng được gắn với chủ đề này.</p>
            </div>
          </div>
          <div className="flex w-fit shrink-0 items-center gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"><Sparkles className="h-5 w-5" /></span>
            <span><span className="block text-xl font-extrabold leading-6 text-slate-900 dark:text-white">{tag?.usageCount ?? '—'}</span><span className="text-xs font-medium text-slate-500 dark:text-slate-400">bài viết</span></span>
          </div>
        </div>
      </header>

      <section aria-labelledby="tag-results-title" className="space-y-5">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">Nội dung theo chủ đề</p>
            <h2 id="tag-results-title" className="mt-1 font-heading text-xl font-bold text-slate-950 dark:text-white">Bài viết gắn với #{tag ? tag.name : decodedSlug}</h2>
          </div>
          <div className="flex w-fit flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" role="group" aria-label="Lọc loại nội dung">
            {([
              { value: 'ALL', label: 'Tất cả', icon: Sparkles },
              { value: 'SERIES', label: 'Khóa học', icon: BookOpen },
              { value: 'COMMUNITY', label: 'Cộng đồng', icon: Users },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" aria-pressed={contentType === value} onClick={() => { setContentType(value); setPage(1); }} className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${contentType === value ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}
              </button>
            ))}
          </div>
        </div>
        <SearchResultsList
          emptyTitle={`Chưa có bài viết cho chủ đề “${tag.name}”`}
          emptyDescription="Chủ đề này chưa có nội dung phù hợp. Hãy khám phá các chủ đề khác hoặc quay lại sau."
          emptyAction={{ label: 'Khám phá chủ đề khác', href: '/the' }}
          filters={{
            tagId: tag.id,
            contentType,
            page,
          }}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}
