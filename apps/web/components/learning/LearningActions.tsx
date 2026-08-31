'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2, LockKeyhole } from 'lucide-react';
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
    try { await learningService.updateProgress(postId, next); }
    catch { setCompleted(!next); }
    finally { setSaving(false); }
  }

  if (!isAuthenticated) return <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground"><LockKeyhole className="mr-2 inline h-4 w-4" />Đăng nhập để lưu tiến độ học.</div>;
  return <button type="button" onClick={() => void toggleCompleted()} disabled={loading || saving} className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm font-semibold transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-wait disabled:opacity-70" aria-pressed={completed}>
    {loading || saving ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : completed ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
    <span>{completed ? 'Đã hoàn thành bài học' : 'Đánh dấu đã hoàn thành'}</span>
  </button>;
}
