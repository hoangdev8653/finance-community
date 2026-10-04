'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
  Map,
  Compass,
  FileText,
  Search,
  ExternalLink,
  Layers,
  ChevronRight,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { learningCourseService } from '@/lib/learning/learning-course-service';
import { postsService } from '@/lib/posts/posts-service';
import type { CategoryEntity, DomainEntity, PostEntity } from '@/types/content';
import type { LearningPathDetail, LearningCourse } from '@/types/learning-course';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast/ToastContext';
import { useDebounce } from '@/lib/hooks/use-debounce';

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
  const [paths, setPaths] = useState<LearningCourse[]>([]);
  const [domains, setDomains] = useState<DomainEntity[]>([]);
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [lessons, setLessons] = useState<PostEntity[]>([]);
  const [selected, setSelected] = useState<LearningPathDetail | null>(null);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<LearningCourse | null>(null);
  const [showSlugInput, setShowSlugInput] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
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

  // Search & Filter state for path list
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  const availableCategories = useMemo(
    () => categories.filter((category) => category.domainId === form.domainId),
    [categories, form.domainId]
  );

  const availableLessons = useMemo(
    () => lessons.filter((lesson) => !selected?.lessons.some((item) => item.id === lesson.id)),
    [lessons, selected]
  );

  // Compute 5 Metric KPI Stats
  const stats = useMemo(() => {
    const total = paths.length;
    const published = paths.filter((p) => p.isPublished).length;
    const drafts = paths.filter((p) => !p.isPublished).length;
    const connectedLessons = lessons.length;
    const domainCount = domains.length;

    return [
      {
        label: 'Tổng khóa học / Lộ trình',
        value: total,
        icon: Map,
        iconWrap: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      },
      {
        label: 'Đã xuất bản',
        value: published,
        icon: CheckCircle2,
        iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      },
      {
        label: 'Bản nháp / Tạm ẩn',
        value: drafts,
        icon: FileText,
        iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      },
      {
        label: 'Bài học đã kết nối',
        value: connectedLessons,
        icon: BookOpen,
        iconWrap: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
      },
      {
        label: 'Lĩnh vực đào tạo',
        value: domainCount,
        icon: Compass,
        iconWrap: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
      },
    ];
  }, [paths, lessons, domains]);

  const load = async () => {
    setLoading(true);
    try {
      const [nextPaths, nextDomains, nextCategories, feed] = await Promise.all([
        learningCourseService.list(),
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
      toast.error('Không thể tải dữ liệu lộ trình.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const selectPath = async (id: string) => {
    try {
      setSelected(await learningCourseService.getAdminPath(id));
      setLessonId('');
    } catch {
      setError('Không thể tải nội dung lộ trình.');
      toast.error('Không thể tải nội dung lộ trình.');
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
    setShowSlugInput(false);
    setIsSlugManuallyEdited(false);
    setModal('create');
  };

  const openEdit = (path: LearningCourse) => {
    setEditing(path);
    setForm({
      title: path.title,
      slug: path.slug,
      description: path.description || '',
      domainId: path.domainId,
      categoryId: path.categoryId,
    });
    setShowSlugInput(false);
    setIsSlugManuallyEdited(true);
    setModal('edit');
  };

  const savePath = async (event: React.FormEvent) => {
    event.preventDefault();
    const finalSlug = form.slug.trim() || undefined;
    if (!form.title.trim() || !form.domainId || !form.categoryId) {
      const msg = 'Hãy nhập đầy đủ thông tin lộ trình (Tiêu đề, lĩnh vực, danh mục).';
      setError(msg);
      toast.error(msg);
      return;
    }
    setBusy(true);
    try {
      const payload = { ...form, slug: finalSlug };
      if (modal === 'create') {
        await learningCourseService.createPath(payload);
        toast.success('Đã tạo lộ trình học tập mới thành công.');
      } else if (editing) {
        await learningCourseService.updatePath(editing.id, payload);
        toast.success('Đã cập nhật thông tin lộ trình thành công.');
      }
      setModal(null);
      await load();
      if (selected && editing && selected.series.id === editing.id) {
        await selectPath(editing.id);
      }
    } catch (reason: any) {
      const msg = reason?.response?.data?.message || 'Không thể lưu lộ trình.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (path: LearningCourse) => {
    try {
      await learningCourseService.updatePath(path.id, { isPublished: !path.isPublished });
      toast.success(path.isPublished ? 'Đã chuyển lộ trình sang Bản nháp.' : 'Đã xuất bản lộ trình cho học viên.');
      await load();
      if (selected?.series.id === path.id) {
        await selectPath(path.id);
      }
    } catch {
      const msg = 'Không thể đổi trạng thái xuất bản.';
      setError(msg);
      toast.error(msg);
    }
  };

  const removePath = async (path: LearningCourse) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lộ trình “${path.title}”?`)) return;
    try {
      await learningCourseService.deletePath(path.id);
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
      await learningCourseService.addLesson(selected.series.id, lessonId, selected.lessons.length + 1);
      toast.success('Đã thêm bài học vào lộ trình.');
      await selectPath(selected.series.id);
    } catch (reason: any) {
      const msg = reason?.response?.data?.message || 'Không thể thêm bài học vào lộ trình.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const move = async (lessonIdToMove: string, targetOrder: number) => {
    if (!selected) return;
    try {
      await learningCourseService.reorderLesson(selected.series.id, lessonIdToMove, targetOrder);
      await selectPath(selected.series.id);
    } catch {
      toast.error('Không thể thay đổi thứ tự bài học.');
    }
  };

  const toggleRequired = async (targetLessonId: string, current: boolean) => {
    if (!selected) return;
    try {
      await learningCourseService.updateLesson(selected.series.id, targetLessonId, !current);
      await selectPath(selected.series.id);
      toast.success(!current ? 'Đã đánh dấu bài học Bắt buộc.' : 'Đã chuyển sang bài học Tùy chọn.');
    } catch {
      toast.error('Không thể cập nhật yêu cầu bài học.');
    }
  };

  const removeLesson = async (targetLessonId: string) => {
    if (!selected) return;
    try {
      await learningCourseService.removeLesson(selected.series.id, targetLessonId);
      toast.success('Đã gỡ bài học khỏi lộ trình.');
      await selectPath(selected.series.id);
    } catch {
      toast.error('Không thể gỡ bài học khỏi lộ trình.');
    }
  };

  // Filtered path list based on search, domain, and status
  const filteredPaths = useMemo(() => {
    return paths.filter((path) => {
      const q = debouncedSearch.trim().toLowerCase();
      const matchSearch = !q || path.title.toLowerCase().includes(q) || path.slug.toLowerCase().includes(q);
      const matchDomain = domainFilter === 'ALL' || path.domainId === domainFilter;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PUBLISHED' && path.isPublished) ||
        (statusFilter === 'DRAFT' && !path.isPublished);
      return matchSearch && matchDomain && matchStatus;
    });
  }, [paths, debouncedSearch, domainFilter, statusFilter]);

  // Lookup domain name helper
  const getDomainName = (domainId: string) => {
    const domain = domains.find((d) => d.id === domainId);
    return domain?.nameVi || domain?.name || 'Chung';
  };

  // Lookup category name helper
  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name || 'Chuyên mục';
  };

  return (
    <div className="learning-paths-surface space-y-6">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Quản lý Khóa học & Lộ trình
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Thiết kế chương trình học tập có cấu trúc, phân loại theo lĩnh vực và sắp xếp bài học theo tiến trình.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            onClick={openCreate}
            className="h-10 gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-2xs hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo lộ trình mới</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
            className="h-10 gap-2 rounded-lg border border-slate-200/70 bg-card px-4 text-sm font-semibold text-foreground shadow-2xs hover:bg-muted dark:border-border/60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới dữ liệu</span>
          </Button>
        </div>
      </div>

      {/* 2. 5 Metric Summary KPI Cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3.5 rounded-[10px] border border-slate-200/60 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-border/60 dark:bg-card"
            >
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-[10px] ${stat.iconWrap}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-foreground">
                  {stat.value.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 3. Main Workspace: Two-Column Master-Detail Layout */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.9fr)]">
        {/* Left column: Path Directory */}
        <section className="space-y-4">
          {/* Surface Container for Filters & List Header */}
          <div className="rounded-[10px] border border-slate-200/60 bg-white p-4 shadow-xs dark:border-border/60 dark:bg-card space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm theo tiêu đề hoặc slug..."
                  className="h-10 w-full rounded-lg border border-slate-200/80 bg-background pl-9 pr-8 text-sm text-foreground shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-border/60"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Domain Filter */}
              <div className="relative min-w-[150px]">
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  aria-label="Lọc theo lĩnh vực"
                  className="h-10 w-full appearance-none rounded-lg border border-slate-200/80 bg-background py-1.5 pl-3 pr-8 text-sm font-medium text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-border/60"
                >
                  <option value="ALL">Mọi lĩnh vực</option>
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameVi || d.name}
                    </option>
                  ))}
                </select>
                <Compass className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-muted-foreground" />
              </div>

              {/* Status Filter */}
              <div className="relative min-w-[140px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  aria-label="Lọc theo trạng thái"
                  className="h-10 w-full appearance-none rounded-lg border border-slate-200/80 bg-background py-1.5 pl-3 pr-8 text-sm font-medium text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-border/60"
                >
                  <option value="ALL">Mọi trạng thái</option>
                  <option value="PUBLISHED">Đã xuất bản</option>
                  <option value="DRAFT">Bản nháp</option>
                </select>
                <Layers className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
              <span>
                Hiển thị <strong className="text-foreground">{filteredPaths.length}</strong> / {paths.length} lộ trình
              </span>
              {(search || domainFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setDomainFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  className="text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Cards List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-[10px] border border-slate-200/60 bg-white p-5 animate-pulse dark:border-border/60 dark:bg-card"
                />
              ))}
            </div>
          ) : filteredPaths.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[10px] border border-slate-200/60 bg-white p-12 text-center dark:border-border/60 dark:bg-card">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-50 text-slate-400 dark:bg-muted/40 dark:text-muted-foreground">
                <Map className="h-7 w-7" />
              </div>
              <h3 className="mt-3 font-heading text-base font-bold text-foreground">
                {search ? 'Không tìm thấy lộ trình nào phù hợp' : 'Chưa có lộ trình học tập nào'}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {search
                  ? `Không có lộ trình nào khớp với từ khóa "${search}".`
                  : 'Hãy bấm “Tạo lộ trình mới” ở góc trên để bắt đầu xây dựng chương trình đào tạo.'}
              </p>
              <Button onClick={openCreate} className="mt-4 gap-1.5 rounded-lg text-xs font-semibold">
                <Plus className="h-4 w-4" />
                <span>Tạo lộ trình ngay</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPaths.map((path) => {
                const isSelected = selected?.series.id === path.id;
                return (
                  <article
                    key={path.id}
                    className={`rounded-[10px] border p-5 transition-all shadow-xs ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-500/30 dark:border-emerald-500 dark:bg-emerald-950/20'
                        : 'border-slate-200/60 bg-white hover:border-emerald-400/70 dark:border-border/60 dark:bg-card'
                    }`}
                  >
                    {/* Header: Badges & Select Click */}
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => void selectPath(path.id)}
                        className="min-w-0 text-left flex-1 group"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="inline-flex items-center rounded-md border border-sky-200/80 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300">
                            {getDomainName(path.domainId)}
                          </span>
                          <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {getCategoryName(path.categoryId)}
                          </span>
                        </div>
                        <h3 className="font-heading text-base font-bold text-foreground transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {path.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                          {path.description || 'Chưa có mô tả chi tiết cho lộ trình này.'}
                        </p>
                        <p className="mt-2 font-mono text-xs text-slate-400 dark:text-slate-500">
                          /{path.slug}
                        </p>
                      </button>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            path.isPublished
                              ? 'border border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'border border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          {path.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void selectPath(path.id)}
                          className="h-8 gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                        >
                          <span>Quản lý bài</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-border/40">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(path)}
                          className="h-8 gap-1.5 rounded-lg border-slate-200/70 text-xs font-semibold hover:bg-slate-50 dark:border-border/60 dark:hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Chỉnh sửa</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void togglePublish(path)}
                          className="h-8 gap-1.5 rounded-lg border-slate-200/70 text-xs font-semibold hover:bg-slate-50 dark:border-border/60 dark:hover:bg-muted"
                        >
                          {path.isPublished ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              <span>Chuyển nháp</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Xuất bản</span>
                            </>
                          )}
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void removePath(path)}
                        aria-label={`Xóa ${path.title}`}
                        className="h-8 gap-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Xóa lộ trình</span>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Right column: Selected Path Lessons Manager */}
        <aside className="rounded-[10px] border border-slate-200/60 bg-white p-5 shadow-xs dark:border-border/60 dark:bg-card space-y-4 self-start sticky top-6">
          <div className="border-b border-slate-100 pb-4 dark:border-border/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  {selected ? selected.series.title : 'Nội dung lộ trình'}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selected
                    ? `${selected.lessons.length} bài học trong chương trình đào tạo này`
                    : 'Chọn một lộ trình từ danh sách bên trái để thêm và sắp xếp bài học.'}
                </p>
              </div>
              {selected && (
                <Link
                  href={`/khoa-hoc/${selected.series.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200/80 bg-background text-muted-foreground shadow-2xs hover:border-emerald-300 hover:text-emerald-600 dark:border-border/60 dark:hover:text-emerald-400"
                  title="Xem trang học viên"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {selected ? (
            <div className="space-y-4">
              {/* Add lesson selector */}
              <div className="flex gap-2">
                <select
                  value={lessonId}
                  onChange={(event) => setLessonId(event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200/80 bg-background px-3 text-xs text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-border/60"
                >
                  <option value="">Chọn bài học đã xuất bản để thêm…</option>
                  {availableLessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={() => void addLesson()}
                  disabled={!lessonId || busy}
                  className="h-10 gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Thêm</span>
                </Button>
              </div>

              {/* Lesson items list */}
              <ol className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {selected.lessons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50/50 p-8 text-center dark:border-border/40 dark:bg-muted/20">
                    <BookOpen className="h-8 w-8 text-muted-foreground/60" />
                    <p className="mt-2 text-xs font-medium text-foreground">
                      Chưa có bài học nào được gán vào lộ trình này
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Hãy chọn một bài học ở khung trên để bắt đầu thêm.
                    </p>
                  </div>
                ) : (
                  selected.lessons.map((lesson, index) => (
                    <li
                      key={lesson.id}
                      className="rounded-lg border border-slate-200/60 bg-background p-3.5 space-y-2.5 shadow-2xs transition-colors hover:border-slate-300 dark:border-border/60 dark:hover:border-border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                          {lesson.lessonOrder}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
                          {lesson.title}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => void move(lesson.id, lesson.lessonOrder - 1)}
                            aria-label="Đưa lên"
                            title="Di chuyển lên trên"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === selected.lessons.length - 1}
                            onClick={() => void move(lesson.id, lesson.lessonOrder + 1)}
                            aria-label="Đưa xuống"
                            title="Di chuyển xuống dưới"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void removeLesson(lesson.id)}
                            aria-label="Gỡ bài học"
                            title="Gỡ khỏi lộ trình"
                            className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] dark:border-border/40">
                        <button
                          type="button"
                          onClick={() => void toggleRequired(lesson.id, lesson.isRequired)}
                          className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${
                            lesson.isRequired ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{lesson.isRequired ? 'Bài học bắt buộc' : 'Bài học tùy chọn'}</span>
                        </button>

                        <span className="font-mono text-slate-400 dark:text-slate-500">
                          #{lesson.lessonOrder}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ol>
            </div>
          ) : (
            /* Empty State compliant with Rule 22 */
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-50 text-slate-400 dark:bg-muted/40 dark:text-muted-foreground">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-foreground">
                Chưa chọn lộ trình nào
              </h3>
              <p className="mt-1.5 max-w-xs text-xs text-muted-foreground leading-relaxed">
                Nhấp vào một lộ trình từ danh sách bên trái để xem, thêm mới hoặc sắp xếp lại thứ tự các bài học.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* 4. Create / Edit Path Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={savePath}
            className="w-full max-w-3xl rounded-[12px] border border-slate-200/80 bg-card p-7 sm:p-8 shadow-2xl space-y-6 text-foreground my-8 dark:border-border/70"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 dark:border-border/40">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {modal === 'create' ? 'Tạo lộ trình học tập mới' : 'Chỉnh sửa lộ trình'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Lộ trình mới sẽ được lưu ở trạng thái Bản nháp trước khi bạn xuất bản cho học viên.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Đóng"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Tên lộ trình <strong className="text-rose-500">*</strong>
                </label>
                <input
                  value={form.title}
                  onChange={(event) => {
                    const nextTitle = event.target.value;
                    setForm((current) => ({
                      ...current,
                      title: nextTitle,
                      slug: isSlugManuallyEdited ? current.slug : slugify(nextTitle),
                    }));
                  }}
                  placeholder="Ví dụ: Nhập môn Đầu tư Chứng khoán từ Nền tảng..."
                  className="h-11 w-full rounded-lg border border-slate-200/80 bg-background px-3.5 text-sm text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-border/60"
                />
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span>Đường dẫn truy cập:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      /khoa-hoc/{form.slug || 'duong-dan-tu-dong'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSlugInput(!showSlugInput)}
                    className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    {showSlugInput ? 'Ẩn tùy chỉnh slug' : 'Tùy chỉnh slug'}
                  </button>
                </div>

                {showSlugInput && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground/60 pointer-events-none">
                        /khoa-hoc/
                      </span>
                      <input
                        value={form.slug}
                        onChange={(event) => {
                          setIsSlugManuallyEdited(true);
                          setForm((current) => ({ ...current, slug: slugify(event.target.value) }));
                        }}
                        placeholder="nhap-mon-chung-khoan"
                        className="h-10 w-full rounded-lg border border-slate-200/80 bg-background pl-24 pr-3.5 font-mono text-xs text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-border/60"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-foreground space-y-1.5">
                  <span>Lĩnh vực đào tạo <strong className="text-rose-500">*</strong></span>
                  <select
                    value={form.domainId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, domainId: event.target.value, categoryId: '' }))
                    }
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200/80 bg-background px-3.5 text-sm font-medium text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-border/60"
                  >
                    <option value="">Chọn lĩnh vực</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.nameVi || domain.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs font-semibold text-foreground space-y-1.5">
                  <span>Danh mục chuyên đề <strong className="text-rose-500">*</strong></span>
                  <select
                    value={form.categoryId}
                    onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200/80 bg-background px-3.5 text-sm font-medium text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-border/60"
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

              <label className="block text-xs font-semibold text-foreground space-y-1.5">
                <span>Mô tả tổng quan khóa học</span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={5}
                  placeholder="Tóm tắt mục tiêu, chuẩn đầu ra và các chủ đề then chốt mà học viên sẽ làm chủ sau khóa học này..."
                  className="w-full min-h-[130px] rounded-lg border border-slate-200/80 bg-background p-3.5 text-sm text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-border/60 resize-y leading-relaxed"
                />
              </label>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100 dark:border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModal(null)}
                className="h-11 px-5 rounded-lg text-sm font-medium border-slate-200/80 hover:bg-muted dark:border-border/60"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                isLoading={busy}
                className="h-11 px-6 rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-2xs hover:bg-emerald-700"
              >
                {modal === 'create' ? 'Tạo lộ trình ngay' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
