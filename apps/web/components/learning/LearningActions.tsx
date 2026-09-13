'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2, LockKeyhole, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { learningService } from '@/lib/learning/learning-service';

interface LearningActionsProps { postId: string; }

export function LearningActions({ postId }: LearningActionsProps) {
  const { isAuthenticated } = useAuth();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(isAuthenticated);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    let active = true;
    void learningService.getProgress(postId).then((progress) => {
      if (active) { setCompleted(Boolean(progress?.completedAt)); setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated, postId]);

  async function toggleCompleted() {
    if (!isAuthenticated || saving) return;
    const next = !completed;
    setCompleted(next); setSaving(true);
    try {
      await learningService.updateProgress(postId, next);
      window.dispatchEvent(new Event('learning-progress-updated'));
    }
    catch { setCompleted(!next); }
    finally { setSaving(false); }
  }

  const icon = loading || saving
    ? <Loader2 className="h-5 w-5 animate-spin" />
    : completed ? <CheckCircle2 className="h-5 w-5" />
      : isAuthenticated ? <Circle className="h-5 w-5" />
        : <LockKeyhole className="h-5 w-5" />;
  const title = !isAuthenticated
    ? 'Lưu hành trình học của bạn'
    : completed ? 'Bạn đã hoàn thành bài học' : 'Hoàn thành bài học này';
  const description = !isAuthenticated
    ? 'Đăng nhập để lưu tiến độ và trở lại đúng bài học này.'
    : completed ? 'Tiến độ của bạn đã được lưu vào lộ trình học.' : 'Đánh dấu khi bạn đã học xong để theo dõi lộ trình.';

  return (
    <section aria-label="Tiến độ bài học" className="my-7 flex flex-col gap-4 rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/80 via-white to-white px-5 py-4 shadow-xs dark:border-emerald-900/70 dark:from-emerald-950/25 dark:via-slate-900 dark:to-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/55 dark:text-emerald-300">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-heading text-base font-bold text-foreground">{title}</p>
          <p className="mt-0.5 text-sm leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      {!isAuthenticated ? (
        <Link href="/dang-nhap" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Đăng nhập để lưu
        </Link>
      ) : (
        <button type="button" onClick={() => void toggleCompleted()} disabled={loading || saving} aria-pressed={completed} className="min-h-10 shrink-0 rounded-xl border border-emerald-300 bg-white px-4 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-950/30">
          {completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
        </button>
      )}
    </section>
  );
}
