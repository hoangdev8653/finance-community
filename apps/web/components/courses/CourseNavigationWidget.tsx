'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { postsService } from '@/lib/posts/posts-service';
import { learningService } from '@/lib/learning/learning-service';
import { useAuth } from '@/lib/auth/AuthContext';

interface SeriesNavData {
  series: { id: string; name: string; slug: string };
  currentPostIndex: number;
  totalPosts: number;
  tableOfContents: Array<{ index: number; id: string; title: string; slug: string; isCurrent: boolean }>;
}

interface CourseNavigationWidgetProps {
  postId: string;
  currentTitle: string;
}

export function CourseNavigationWidget({ postId, currentTitle }: CourseNavigationWidgetProps) {
  const { isAuthenticated } = useAuth();
  const [navData, setNavData] = useState<SeriesNavData | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const [completedPostIds, setCompletedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    void postsService.getSeriesNavigation(postId)
      .then((data) => { if (active) setNavData(data); })
      .catch(() => { if (active) setHasFailed(true); });
    return () => { active = false; };
  }, [postId]);

  useEffect(() => {
    const refreshProgress = () => {
      if (!isAuthenticated) { setCompletedPostIds(new Set()); return; }
      void learningService.getUserProgress().then((items) => {
        setCompletedPostIds(new Set(items.filter((item) => item.completedAt).map((item) => item.postId)));
      }).catch(() => setCompletedPostIds(new Set()));
    };
    refreshProgress();
    window.addEventListener('learning-progress-updated', refreshProgress);
    return () => window.removeEventListener('learning-progress-updated', refreshProgress);
  }, [isAuthenticated]);

  if (!navData) return <LessonTimelineFallback currentTitle={currentTitle} isLoading={!hasFailed} />;

  const href = (slug: string) => `/khoa-hoc/${encodeURIComponent(navData.series.slug)}/${encodeURIComponent(slug)}`;
  const completedCount = navData.tableOfContents.filter((item) => completedPostIds.has(item.id)).length;
  const progress = navData.totalPosts ? Math.round((completedCount / navData.totalPosts) * 100) : 0;
  const nextAvailableIndex = navData.tableOfContents.findIndex((item) => !completedPostIds.has(item.id));

  return (
    <section aria-label="Lộ trình khóa học" className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold text-slate-950 dark:text-white">Lộ trình khóa học</h2>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{completedCount} / {navData.totalPosts} bài</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} /></div>
      </header>
      <ol className="mt-5 space-y-1">
        {navData.tableOfContents.map((item) => {
          const completed = completedPostIds.has(item.id);
          const locked = !completed && (nextAvailableIndex === -1 ? false : item.index - 1 > nextAvailableIndex);
          return <li key={item.id} className="relative pl-11 last:pb-0">
            <span aria-hidden className="absolute left-[15px] top-8 h-[calc(100%+8px)] w-px bg-emerald-200 last:hidden dark:bg-emerald-900" />
            <LessonNumber index={item.index} completed={completed} current={item.isCurrent} locked={locked} />
            <Link href={href(item.slug)} aria-current={item.isCurrent ? 'page' : undefined} className={`block rounded-xl px-3 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${item.isCurrent ? 'bg-emerald-50 font-bold text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200' : locked ? 'pointer-events-none text-slate-400 dark:text-slate-500' : 'font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-emerald-300'}`}>
              <span className="line-clamp-2 leading-5">{item.title}</span>
            </Link>
          </li>;
        })}
      </ol>
    </section>
  );
}

function LessonNumber({ index, completed, current, locked }: { index: number; completed: boolean; current: boolean; locked: boolean }) {
  return <span className={`absolute left-0 top-3 grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold transition-colors ${completed ? 'bg-emerald-600 text-white' : current ? 'border-2 border-emerald-600 bg-white text-emerald-700 ring-4 ring-emerald-100 dark:bg-slate-900 dark:text-emerald-300 dark:ring-emerald-950/70' : 'border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'}`}>
    {locked ? <LockKeyhole className="h-3.5 w-3.5" /> : String(index).padStart(2, '0')}
  </span>;
}

function LessonTimelineFallback({ currentTitle, isLoading }: { currentTitle: string; isLoading: boolean }) {
  const lessons = ['Tổng quan và mục tiêu bài học', 'Hiểu những khái niệm nền tảng', currentTitle, 'Thực hành và tổng kết'];
  return <section aria-label="Lộ trình khóa học" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="font-heading text-lg font-bold text-slate-950 dark:text-white">Lộ trình khóa học</h2><span className="text-xs font-bold text-emerald-700">3 / 8 bài</span></div>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[38%] rounded-full bg-emerald-600" /></div>
    <ol className="mt-5 space-y-1">
      {lessons.map((lesson, index) => {
        const lessonIndex = index + 1;
        const completed = lessonIndex < 3;
        const current = lessonIndex === 3;
        const locked = lessonIndex > 3;
        return <li key={`${lesson}-${lessonIndex}`} className="relative pl-11">
          <span aria-hidden className="absolute left-[15px] top-8 h-[calc(100%+8px)] w-px bg-emerald-200 last:hidden" />
          <LessonNumber index={lessonIndex} completed={completed} current={current} locked={locked} />
          <div className={`rounded-xl px-3 py-3 text-sm leading-5 ${current ? 'bg-emerald-50 font-bold text-emerald-900' : locked ? 'text-slate-400' : 'font-medium text-slate-700'}`}>{lesson}</div>
        </li>;
      })}
    </ol>
    {isLoading && <p className="mt-4 text-center text-xs text-slate-400">Đang đồng bộ lộ trình…</p>}
  </section>;
}
