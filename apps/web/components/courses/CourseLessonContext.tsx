import Link from 'next/link';
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react';

interface CourseLessonContextProps {
  name: string;
  slug: string;
}

export function CourseLessonContext({ name, slug }: CourseLessonContextProps) {
  const seriesUrl = `/khoa-hoc/${encodeURIComponent(slug)}`;

  return (
    <section
      aria-label={`Bài học thuộc khóa học ${name}`}
      className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 shadow-xs dark:border-emerald-900/70 dark:bg-emerald-950/20 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-300">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">
            Bài học trong khóa học
          </p>
          <Link
            href={seriesUrl}
            className="mt-1 inline-flex items-center gap-2 font-heading text-base font-bold text-slate-950 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:text-white dark:hover:text-emerald-300"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            {name}
          </Link>
        </div>
      </div>
      <Link
        href={seriesUrl}
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800 sm:mt-0"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Xem khóa học
      </Link>
    </section>
  );
}
