'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { learningSeriesService } from '@/lib/learning/learning-series-service';
import type { LearningSeries } from '@/types/learning-series';

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningSeries[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { learningSeriesService.listPaths().then(setPaths).catch(() => setPaths([])).finally(() => setLoading(false)); }, []);

  return <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
    <header className="mb-10 max-w-3xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary"><GraduationCap className="h-4 w-4" />Học có lộ trình</div><h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">Lộ trình học tài chính</h1><p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">Đi từng bước từ kiến thức nền tảng đến khả năng áp dụng. Mỗi lộ trình gồm các bài học được sắp xếp theo thứ tự rõ ràng.</p><Link href="/learning/explore" className="mt-5 inline-flex items-center rounded-lg border border-primary/30 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/5">Khám phá bài học</Link></header>
    {loading ? <p className="text-sm text-muted-foreground">Đang tải lộ trình…</p> : paths.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-center"><BookOpen className="mx-auto h-8 w-8 text-muted-foreground" /><h2 className="mt-3 font-semibold">Lộ trình đang được xây dựng</h2><p className="mt-1 text-sm text-muted-foreground">Hãy quay lại sớm để bắt đầu hành trình học của bạn.</p></div> : <div className="grid gap-5 md:grid-cols-2">{paths.map((path) => <Link key={path.id} href={`/learning-paths/${encodeURIComponent(path.slug)}`} className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"><BookOpen className="h-6 w-6 text-primary" /><h2 className="mt-5 text-xl font-bold">{path.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{path.description || 'Lộ trình bài học được sắp xếp để bạn học và áp dụng từng bước.'}</p><span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-primary">Xem lộ trình <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>)}</div>}
  </main>;
}
