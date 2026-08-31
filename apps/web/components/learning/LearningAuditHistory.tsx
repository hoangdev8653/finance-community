'use client';
import { useEffect, useState } from 'react';
import { History, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

type AuditItem = { id?: string; action: string; actor_id?: string | null; actorId?: string | null; actorEmail?: string | null; created_at?: string; createdAt?: string };
const labels: Record<string, string> = { LEARNING_SUBMIT_REVIEW: 'Gửi bài để duyệt', LEARNING_STATUS_UPDATE: 'Cập nhật trạng thái' };
export function LearningAuditHistory({ postId }: { postId: string }) {
  const [items, setItems] = useState<AuditItem[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; void apiClient.get<AuditItem[]>(`/learning/admin/posts/${postId}/audit-history`).then(({ data }) => { if (active) setItems(data); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [postId]);
  return <section className="space-y-4 rounded-2xl border border-border bg-muted/20 p-5"><div className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold">Lịch sử biên tập</h2></div>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : items.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có lịch sử thay đổi.</p> : <ol className="space-y-3">{items.map((item) => { const timestamp = item.createdAt || item.created_at; const actor = item.actorEmail || item.actor_id || item.actorId || 'Hệ thống'; return <li key={item.id || `${item.action}-${timestamp}`} className="border-l-2 border-primary/30 pl-4"><p className="text-sm font-semibold">{labels[item.action] || item.action}</p><p className="mt-1 text-xs text-muted-foreground">{timestamp ? new Date(timestamp).toLocaleString('vi-VN') : 'Không rõ thời gian'} · {actor}</p></li>; })}</ol>}</section>;
}
