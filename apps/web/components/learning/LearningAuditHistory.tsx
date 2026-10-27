'use client';

import { useEffect, useState } from 'react';
import { History, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

type AuditItem = {
  id?: string;
  action: string;
  actor_id?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  created_at?: string;
  createdAt?: string;
};

const labels: Record<string, string> = {
  LEARNING_SUBMIT_REVIEW: 'Gửi bài để duyệt',
  LEARNING_STATUS_UPDATE: 'Cập nhật trạng thái',
};

export function LearningAuditHistory({ postId }: { postId: string }) {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void apiClient.get<AuditItem[]>(`/learning/admin/posts/${postId}/audit-history`).then(({ data }) => {
      if (active) setItems(data);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [postId]);

  return (
    <section className="font-sans overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300"><History className="h-5 w-5" /></span>
        <div>
          <h3 className="font-heading text-base font-bold text-foreground">Lịch sử biên tập</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Các thay đổi trạng thái của bài học</p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Đang tải lịch sử…</div>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">Chưa có lịch sử thay đổi.</p>
        ) : (
          <ol className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => {
              const timestamp = item.createdAt || item.created_at;
              const actor = item.actorEmail || item.actor_id || item.actorId || 'Hệ thống';
              return (
                <li key={item.id || `${item.action}-${timestamp}`} className="flex gap-3 rounded-xl border border-border/80 bg-muted/20 p-3.5">
                  <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/10" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{labels[item.action] || item.action}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {timestamp ? new Date(timestamp).toLocaleString('vi-VN') : 'Không rõ thời gian'}
                      <span className="mx-1.5">·</span>
                      <span className="break-all">{actor}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
