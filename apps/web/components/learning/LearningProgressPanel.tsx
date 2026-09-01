'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { learningService, LearningProgress } from '@/lib/learning/learning-service';

type ProgressItem = LearningProgress & { postId: string; title: string; slug: string };

export function LearningProgressPanel() {
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => { void fetchProgress(); }, []);
  async function fetchProgress() { setLoading(true); setError(false); try { setItems(await learningService.getUserProgress()); } catch { setError(true); } finally { setLoading(false); } }
  if (loading) return <div className="flex items-center gap-2 rounded-2xl border border-border p-5 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Đang tải tiến độ học…</div>;
  if (error) return <section className="rounded-2xl border border-danger/30 bg-danger/5 p-5" role="alert"><p className="text-sm text-danger">Không thể tải tiến độ học tập.</p><button type="button" onClick={() => void fetchProgress()} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-danger/30 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10"><RefreshCw className="h-3.5 w-3.5" />Thử lại</button></section>;
  const completedCount = items.filter((item) => item.completedAt).length;
  return <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7" aria-labelledby="learning-progress-title"><div className="mb-5 flex items-center gap-3"><BookOpen className="h-5 w-5 text-primary" /><h2 id="learning-progress-title" className="text-xl font-bold">Tiến độ học tập</h2></div><div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-xl bg-muted/40 p-4"><p className="text-xs text-muted-foreground">Bài đã bắt đầu</p><p className="mt-1 text-2xl font-bold">{items.length}</p></div><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Bài hoàn thành</p><p className="mt-1 text-2xl font-bold text-emerald-700">{completedCount}</p></div><div className="col-span-2 rounded-xl bg-primary/5 p-4 sm:col-span-1"><p className="text-xs text-primary">Tỷ lệ hoàn thành</p><p className="mt-1 text-2xl font-bold text-primary">{items.length ? Math.round((completedCount / items.length) * 100) : 0}%</p></div></div>{items.length === 0 ? <p className="text-sm text-muted-foreground">Bạn chưa bắt đầu bài học nào. Hãy khám phá một series để bắt đầu.</p> : <div className="space-y-3">{items.map((item) => <Link key={item.postId} href={`/posts/series/${encodeURIComponent(item.slug)}`} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary"><CheckCircle2 className={`h-5 w-5 shrink-0 ${item.completedAt ? 'text-emerald-600' : 'text-muted-foreground'}`} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.title}</span><span className="text-xs text-muted-foreground">{item.completedAt ? `Hoàn thành ${new Date(item.completedAt).toLocaleDateString('vi-VN')}` : 'Đang học · Tiếp tục bài này'}</span></span><span className="text-xs font-semibold text-primary">{item.completedAt ? 'Đã học' : 'Tiếp tục'}</span></Link>)}</div>}</section>;
}
