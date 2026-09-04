'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
  RefreshCw,
} from 'lucide-react';
import { learningSeriesService } from '@/lib/learning/learning-series-service';
import { postsService } from '@/lib/posts/posts-service';
import type { CategoryEntity, DomainEntity, PostEntity } from '@/types/content';
import type { LearningPathDetail, LearningSeries } from '@/types/learning-series';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/lib/toast/ToastContext';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export function LearningPathsManager() {
  const { toast } = useToast();
  const [paths, setPaths] = useState<LearningSeries[]>([]);
  const [domains, setDomains] = useState<DomainEntity[]>([]);
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [lessons, setLessons] = useState<PostEntity[]>([]);
  const [selected, setSelected] = useState<LearningPathDetail | null>(null);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<LearningSeries | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    domainId: '',
    categoryId: '',
  });
  const [lessonId, setLessonId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.domainId === form.domainId),
    [categories, form.domainId]
  );
  const availableLessons = useMemo(
    () => lessons.filter((lesson) => !selected?.lessons.some((item) => item.id === lesson.id)),
    [lessons, selected]
  );

  const load = async () => {
    setLoading(true);
    try {
      const [nextPaths, nextDomains, nextCategories, feed] = await Promise.all([
        learningSeriesService.list(),
        postsService.getDomains(),
        postsService.getCategories('SERIES'),
        postsService.getFeed({ contentType: 'SERIES', limit: 100, sortBy: 'publishedAt' }),
      ]);
      setPaths(nextPaths);
      setDomains(nextDomains.filter((domain) => domain.isActive));
      setCategories(nextCategories);
      setLessons(feed.data);
    } catch {
      setError('Không thể tải dữ liệu lộ trình.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const selectPath = async (id: string) => {
    try {
      setSelected(await learningSeriesService.getAdminPath(id));
      setLessonId('');
    } catch {
      setError('Không thể tải nội dung lộ trình.');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      slug: '',
      description: '',
      domainId: domains[0]?.id || '',
      categoryId: '',
    });
    setModal('create');
  };

  const openEdit = (path: LearningSeries) => {
    setEditing(path);
    setForm({
      title: path.title,
      slug: path.slug,
      description: path.description || '',
      domainId: path.domainId,
      categoryId: path.categoryId,
    });
    setModal('edit');
  };

  const savePath = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.slug || !form.domainId || !form.categoryId) {
      const msg = 'Hãy nhập đầy đủ thông tin lộ trình.';
      setError(msg);
      toast.error(msg);
      return;
    }
    setBusy(true);
    try {
      if (modal === 'create') {
        await learningSeriesService.createPath(form);
        toast.success('Đã tạo lộ trình mới.');
      } else if (editing) {
        await learningSeriesService.updatePath(editing.id, form);
        toast.success('Đã cập nhật lộ trình.');
      }
      setModal(null);
      await load();
    } catch (reason: any) {
      const msg = reason?.response?.data?.message || 'Không thể lưu lộ trình.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (path: LearningSeries) => {
    try {
      await learningSeriesService.updatePath(path.id, { isPublished: !path.isPublished });
      toast.success(path.isPublished ? 'Đã chuyển sang bản nháp.' : 'Đã xuất bản lộ trình.');
      await load();
    } catch {
      const msg = 'Không thể đổi trạng thái xuất bản.';
      setError(msg);
      toast.error(msg);
    }
  };

  const removePath = async (path: LearningSeries) => {
    if (!window.confirm(`Xóa lộ trình “${path.title}”?`)) return;
    try {
      await learningSeriesService.deletePath(path.id);
      toast.success(`Đã xóa lộ trình “${path.title}”.`);
      if (selected?.series.id === path.id) setSelected(null);
      await load();
    } catch (reason: any) {
      const msg = reason?.response?.data?.message || 'Không thể xóa lộ trình.';
      setError(msg);
      toast.error(msg);
    }
  };

  const addLesson = async () => {
    if (!selected || !lessonId) return;
    setBusy(true);
    try {
      await learningSeriesService.addLesson(selected.series.id, lessonId, selected.lessons.length + 1);
      toast.success('Đã thêm bài học vào lộ trình.');
      await selectPath(selected.series.id);
    } catch (reason: any) {
      const msg = reason?.response?.data?.message || 'Không thể thêm bài học.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const move = async (postId: string, order: number) => {
    if (!selected) return;
    await learningSeriesService.reorderLesson(selected.series.id, postId, order);
    await selectPath(selected.series.id);
  };

  const toggleRequired = async (postId: string, required: boolean) => {
    if (!selected) return;
    await learningSeriesService.updateLesson(selected.series.id, postId, !required);
    await selectPath(selected.series.id);
  };

  const removeLesson = async (postId: string) => {
    if (!selected || !window.confirm('Gỡ bài học này khỏi lộ trình?')) return;
    try {
      await learningSeriesService.removeLesson(selected.series.id, postId);
      toast.success('Đã gỡ bài học khỏi lộ trình.');
      await selectPath(selected.series.id);
    } catch (reason: any) {
      const msg = reason?.response?.data?.message || 'Không thể gỡ bài học.';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground">
              Trình biên tập lộ trình
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Tạo lộ trình học tập có cấu trúc, gán bài học và thiết lập thứ tự bài học
          </p>
        </div>
        <Button onClick={openCreate} className="h-9 gap-1.5 self-start sm:self-auto text-xs font-mono">
          <Plus className="h-4 w-4" />
          <span>Tạo lộ trình</span>
        </Button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-xs font-medium text-danger">
          {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
        {/* Left column: Path List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-mono text-xs font-bold uppercase text-muted-foreground">
              Danh sách lộ trình ({paths.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={() => void load()} className="h-7 text-xs font-mono">
              <RefreshCw className="h-3 w-3 mr-1" />
              Tải lại
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-xl border border-border bg-surface/50 animate-pulse" />
              ))}
            </div>
          ) : paths.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center text-xs text-muted-foreground">
              Chưa có lộ trình nào. Hãy bấm “Tạo lộ trình” để bắt đầu.
            </div>
          ) : (
            paths.map((path) => (
              <article
                key={path.id}
                className={`rounded-xl border p-4 transition-all shadow-2xs ${
                  selected?.series.id === path.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border bg-surface hover:border-primary/40'
                }`}
              >
                <div className="flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => void selectPath(path.id)}
                    className="min-w-0 text-left flex-1"
                  >
                    <h3 className="font-bold text-sm text-foreground">{path.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {path.description || 'Chưa có mô tả.'}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground/70">{path.slug}</p>
                  </button>
                  <span className="shrink-0">
                    <Badge variant={path.isPublished ? 'success' : 'secondary'} className="text-3xs font-mono">
                      {path.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                    </Badge>
                  </span>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(path)} className="h-7 px-2.5 text-xs font-mono">
                    <Pencil className="mr-1 h-3 w-3" />
                    Sửa
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void togglePublish(path)} className="h-7 px-2.5 text-xs font-mono">
                    <Send className="mr-1 h-3 w-3" />
                    {path.isPublished ? 'Ẩn' : 'Xuất bản'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void removePath(path)}
                    aria-label={`Xóa ${path.title}`}
                    className="h-7 px-2 text-xs font-mono text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Right column: Selected Path Lessons Manager */}
        <aside className="rounded-xl border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="font-heading font-bold text-sm text-foreground">
              {selected ? selected.series.title : 'Nội dung lộ trình'}
            </h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {selected ? `${selected.lessons.length} bài học trong lộ trình` : 'Chọn một lộ trình bên trái để quản lý bài học'}
            </p>
          </div>

          {selected ? (
            <>
              <div className="flex gap-2">
                <select
                  value={lessonId}
                  onChange={(event) => setLessonId(event.target.value)}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary font-sans"
                >
                  <option value="">Thêm bài học đã xuất bản…</option>
                  {availableLessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                <Button size="sm" onClick={() => void addLesson()} disabled={!lessonId || busy} className="h-9 px-3 text-xs font-mono">
                  Thêm
                </Button>
              </div>

              <ol className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {selected.lessons.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    Chưa có bài học nào được gán vào lộ trình này.
                  </div>
                ) : (
                  selected.lessons.map((lesson, index) => (
                    <li key={lesson.id} className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center text-xs font-bold text-muted-foreground font-mono">
                          {lesson.lessonOrder}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
                          {lesson.title}
                        </span>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => void move(lesson.id, lesson.lessonOrder - 1)}
                          aria-label="Đưa lên"
                          className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === selected.lessons.length - 1}
                          onClick={() => void move(lesson.id, lesson.lessonOrder + 1)}
                          aria-label="Đưa xuống"
                          className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeLesson(lesson.id)}
                          aria-label="Gỡ bài học"
                          className="rounded p-1 text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => void toggleRequired(lesson.id, lesson.isRequired)}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          lesson.isRequired ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {lesson.isRequired ? 'Bài bắt buộc' : 'Bài tùy chọn'}
                      </button>
                    </li>
                  ))
                )}
              </ol>
            </>
          ) : (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-border p-12 text-center text-xs text-muted-foreground space-y-2">
              <BookOpen className="h-8 w-8 text-muted-foreground/60" />
              <p>Chọn một lộ trình từ danh sách bên trái để thêm và sắp xếp bài học.</p>
            </div>
          )}
        </aside>
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" role="dialog" aria-modal="true">
          <form onSubmit={savePath} className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-xl space-y-4">
            <div className="flex justify-between gap-3 border-b border-border pb-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  {modal === 'create' ? 'Tạo lộ trình mới' : 'Sửa lộ trình'}
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Lộ trình mới được lưu ở trạng thái bản nháp trước khi xuất bản.
                </p>
              </div>
              <button type="button" onClick={() => setModal(null)} aria-label="Đóng" className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="block text-xs font-semibold text-foreground">
              Tên lộ trình
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                    slug: current.slug || slugify(event.target.value),
                  }))
                }
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
              />
            </label>

            <label className="block text-xs font-semibold text-foreground">
              Đường dẫn (Slug)
              <input
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 font-mono text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
              />
            </label>

            <label className="block text-xs font-semibold text-foreground">
              Mô tả
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-foreground">
                Lĩnh vực
                <select
                  value={form.domainId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, domainId: event.target.value, categoryId: '' }))
                  }
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary font-sans"
                >
                  <option value="">Chọn lĩnh vực</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.nameVi || domain.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-semibold text-foreground">
                Danh mục
                <select
                  value={form.categoryId}
                  onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary font-sans"
                >
                  <option value="">Chọn danh mục</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setModal(null)} className="text-xs h-8">
                Hủy
              </Button>
              <Button type="submit" size="sm" isLoading={busy} className="text-xs h-8 font-mono">
                Lưu lộ trình
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
