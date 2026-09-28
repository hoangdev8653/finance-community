'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Flame, Hash, Search, Tag, X } from 'lucide-react';
import { useTags } from '@/lib/posts/use-posts-feed';
import { TagCard } from './TagCard';
import { TagsSkeleton } from './TagsSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';

export function TagsDirectoryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: tags = [], isLoading, isError, error, refetch } = useTags('', 100);

  const filteredTags = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('vi-VN');
    return [...tags]
      .filter((tag) => !query || tag.name.toLocaleLowerCase('vi-VN').includes(query) || tag.slug.toLocaleLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [tags, searchQuery]);

  const popularTags = useMemo(
    () => [...tags]
      .filter((tag) => typeof tag.usageCount === 'number' && tag.usageCount > 0)
      .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
      .slice(0, 6),
    [tags]
  );

  return (
    <div className="w-full space-y-8 pt-2 sm:pt-3">
      <header className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-white via-emerald-50 to-teal-100 p-6 sm:p-9 dark:border-emerald-900/60 dark:from-slate-900 dark:via-emerald-950/40 dark:to-teal-950/50">
        <div className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full bg-emerald-300/40 blur-3xl dark:bg-emerald-600/15" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
            <Tag className="h-3.5 w-3.5" aria-hidden="true" /> Thư viện chủ đề
          </div>
          <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl dark:text-white">
            Khám phá theo chủ đề
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
            Tìm nhanh các chủ đề, lĩnh vực và mã cổ phiếu đang được nhắc đến trong bài học và cộng đồng.
          </p>
          <label className="relative mt-6 block max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm chủ đề hoặc mã cổ phiếu (VD: FPT, sức khỏe...)"
              aria-label="Tìm chủ đề"
              data-testid="tags-search-input"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white/95 pl-12 pr-12 text-sm font-medium text-slate-900 shadow-lg shadow-emerald-950/5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-900/90 dark:text-white"
            />
            {searchQuery && <button type="button" onClick={() => setSearchQuery('')} aria-label="Xóa nội dung tìm kiếm" className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"><X className="h-4 w-4" /></button>}
          </label>
          {!isLoading && !isError && <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">{searchQuery.trim() ? `${filteredTags.length} kết quả phù hợp` : `${tags.length} chủ đề đang có`}</p>}
        </div>
      </header>

      {isLoading && <TagsSkeleton data-testid="tags-loading-skeleton" />}

      {isError && <ErrorState title="Không thể tải danh sách chủ đề" message={error instanceof Error ? error.message : 'Đã có lỗi khi tải dữ liệu. Vui lòng thử lại.'} onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          {!searchQuery.trim() && popularTags.length > 0 && (
            <section aria-labelledby="popular-tags-heading" className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"><Flame className="h-4 w-4" /></span>
                <div><h2 id="popular-tags-heading" className="font-heading text-base font-bold text-slate-950 dark:text-white">Chủ đề phổ biến</h2><p className="text-xs text-slate-500 dark:text-slate-400">Được quan tâm nhiều trong cộng đồng</p></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Link key={tag.id} href={`/the/${encodeURIComponent(tag.slug)}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-emerald-300">
                    <Hash className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />{tag.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="all-tags-heading" className="space-y-4">
            <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
              <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400">Thư viện</p><h2 id="all-tags-heading" className="mt-1 font-heading text-xl font-bold text-slate-950 dark:text-white">{searchQuery.trim() ? 'Kết quả tìm chủ đề' : 'Tất cả chủ đề'}</h2></div>
              <span className="shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">{filteredTags.length} chủ đề</span>
            </div>
            {filteredTags.length === 0 ? (
              <EmptyState title={searchQuery.trim() ? `Không có chủ đề phù hợp với “${searchQuery}”` : 'Chưa có chủ đề'} description={searchQuery.trim() ? 'Thử từ khóa khác hoặc xóa nội dung tìm kiếm.' : 'Hiện chưa có chủ đề nào trong hệ thống.'} actionLabel={searchQuery.trim() ? 'Xóa bộ lọc' : undefined} onAction={searchQuery.trim() ? () => setSearchQuery('') : undefined} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTags.map((tag) => <TagCard key={tag.id} tag={tag} />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
