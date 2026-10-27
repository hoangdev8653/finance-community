'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ExternalLink, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

type Source = { id: string; title: string; url: string; publisher: string | null; checkedAt: string | null };

const fieldClassName =
  'min-h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/75 focus:border-primary focus:ring-2 focus:ring-primary/15';

export function LearningSourceManager({ postId }: { postId: string }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [publisher, setPublisher] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await apiClient.get<Source[]>(`/learning/posts/${postId}/sources`);
      setSources(response.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [postId]);

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setSaving(true);
    try {
      await apiClient.post(`/learning/admin/posts/${postId}/sources`, {
        title: title.trim(),
        url: url.trim(),
        publisher: publisher.trim() || undefined,
      });
      setTitle('');
      setUrl('');
      setPublisher('');
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await apiClient.delete(`/learning/admin/sources/${id}`);
    setSources((current) => current.filter((source) => source.id !== id));
  }

  return (
    <section className="font-sans overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">Nguồn tham khảo</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Tài liệu giúp kiểm chứng nội dung bài học</p>
          </div>
        </div>
        {!loading && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {sources.length} nguồn
          </span>
        )}
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <form onSubmit={add} className="grid items-end gap-3 lg:grid-cols-12">
          <label className="space-y-1.5 lg:col-span-4">
            <span className="text-xs font-semibold text-foreground">Tên tài liệu <span className="text-destructive">*</span></span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Báo cáo thường niên 2025" className={fieldClassName} required />
          </label>
          <label className="space-y-1.5 lg:col-span-4">
            <span className="text-xs font-semibold text-foreground">Đường dẫn <span className="text-destructive">*</span></span>
            <input value={url} onChange={(event) => setUrl(event.target.value)} type="url" placeholder="https://example.com/tai-lieu" className={fieldClassName} required />
          </label>
          <label className="space-y-1.5 lg:col-span-2">
            <span className="text-xs font-semibold text-foreground">Nhà xuất bản</span>
            <input value={publisher} onChange={(event) => setPublisher(event.target.value)} placeholder="Không bắt buộc" className={fieldClassName} />
          </label>
          <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Thêm nguồn
          </button>
        </form>

        {loading ? (
          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Đang tải nguồn tham khảo…</div>
        ) : sources.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {sources.map((source) => (
              <li key={source.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border/80 bg-muted/25 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background text-primary"><ExternalLink className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <a href={source.url} target="_blank" rel="noreferrer" className="block truncate text-sm font-semibold text-foreground hover:text-primary">{source.title}</a>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{source.publisher || source.url}</p>
                </div>
                <button type="button" onClick={() => void remove(source.id)} aria-label={`Xóa nguồn ${source.title}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Chưa có nguồn nào. Thêm tài liệu để tăng độ tin cậy cho bài học.</p>
          </div>
        )}
      </div>
    </section>
  );
}
