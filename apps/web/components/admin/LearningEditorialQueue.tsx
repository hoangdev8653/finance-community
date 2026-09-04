'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, Loader2, RefreshCw } from 'lucide-react';
import { learningAdminService } from '@/lib/learning/learning-admin-service';
import type { EditorialStatus, LearningAdminPost } from '@/types/learning-admin';
import { Button } from '@/components/ui/Button';

const statuses: Array<{ value: EditorialStatus; label: string }> = [
  { value: 'REVIEW', label: 'Chờ duyệt' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'PUBLISHED', label: 'Đã xuất bản' },
  { value: 'NEEDS_UPDATE', label: 'Cần cập nhật' },
  { value: 'ARCHIVED', label: 'Lưu trữ' },
];

export function LearningEditorialQueue() {
  const [filter, setFilter] = useState<EditorialStatus>('REVIEW');
  const [posts, setPosts] = useState<LearningAdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setPosts((await learningAdminService.getPosts(filter)).data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [filter]);

  async function changeStatus(id: string, status: EditorialStatus) {
    setSaving(id);
    try {
      await learningAdminService.updateStatus(id, status);
      await load();
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="space-y-6">
      {/* Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground">
              Duyệt nội dung học tập
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Kiểm tra và chuyển trạng thái bài học trước khi xuất bản
          </p>
        </div>

        {/* Filter Tabs in Header */}
        <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg self-start sm:self-auto text-xs font-mono">
          {statuses.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => setFilter(status.value)}
              className={`px-3 py-1.5 rounded-md transition-all font-semibold ${
                filter === status.value
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{posts.length} bài học</span>
          <span>•</span>
          <span>Trạng thái: {statuses.find((s) => s.value === filter)?.label}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
          className="h-8 text-xs self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          <span>Làm mới dữ liệu</span>
        </Button>
      </div>

      {/* Content Container */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface p-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Đang tải bài học…</span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xs">
          {posts.length === 0 ? (
            <p className="p-12 text-center text-sm text-muted-foreground">
              Không có bài học ở trạng thái này.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-sm text-foreground">{post.title}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                      Cập nhật {new Date(post.updatedAt).toLocaleDateString('vi-VN')} · {post.slug}
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <select
                      value={post.editorialStatus}
                      disabled={saving === post.id}
                      onChange={(event) =>
                        void changeStatus(post.id, event.target.value as EditorialStatus)
                      }
                      className="h-9 appearance-none rounded-lg border border-border bg-surface py-1.5 pl-3 pr-8 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <option value="DRAFT">Bản nháp</option>
                      <option value="REVIEW">Chờ duyệt</option>
                      <option value="PUBLISHED">Đã xuất bản</option>
                      <option value="NEEDS_UPDATE">Cần cập nhật</option>
                      <option value="ARCHIVED">Lưu trữ</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
