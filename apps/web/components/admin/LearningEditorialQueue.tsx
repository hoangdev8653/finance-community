'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock3,
  FileText,
  CheckCircle2,
  AlertCircle,
  Archive,
  RefreshCw,
  Map,
  Search,
  X,
  ChevronDown,
  Loader2,
  Calendar,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { learningAdminService } from '@/lib/learning/learning-admin-service';
import type { EditorialStatus, LearningAdminPost } from '@/types/learning-admin';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast/ToastContext';
import { useDebounce } from '@/lib/hooks/use-debounce';

type FilterTab = 'ALL' | EditorialStatus;

interface StatusConfig {
  value: FilterTab;
  label: string;
  badgeClass: string;
}

const STATUS_CONFIGS: StatusConfig[] = [
  {
    value: 'ALL',
    label: 'Tất cả',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  {
    value: 'REVIEW',
    label: 'Chờ duyệt',
    badgeClass: 'bg-amber-50 text-amber-600 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
  },
  {
    value: 'DRAFT',
    label: 'Bản nháp',
    badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  {
    value: 'PUBLISHED',
    label: 'Đã xuất bản',
    badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
  },
  {
    value: 'NEEDS_UPDATE',
    label: 'Cần cập nhật',
    badgeClass: 'bg-orange-50 text-orange-600 border border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/50',
  },
  {
    value: 'ARCHIVED',
    label: 'Lưu trữ',
    badgeClass: 'bg-purple-50 text-purple-600 border border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50',
  },
];

export function LearningEditorialQueue() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<FilterTab>('REVIEW');
  const [allPosts, setAllPosts] = useState<LearningAdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  // Load posts from server
  async function loadData() {
    setLoading(true);
    try {
      // Fetch all learning posts without editorialStatus filter to calculate real stats
      const res = await learningAdminService.getPosts();
      setAllPosts(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách bài học học tập.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  // Update editorial status with feedback
  async function changeStatus(id: string, newStatus: EditorialStatus) {
    setSavingId(id);
    try {
      await learningAdminService.updateStatus(id, newStatus);
      setAllPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, editorialStatus: newStatus } : p))
      );
      const statusLabel = STATUS_CONFIGS.find((s) => s.value === newStatus)?.label || newStatus;
      toast.success(`Đã cập nhật trạng thái bài học thành "${statusLabel}".`);
    } catch {
      toast.error('Không thể cập nhật trạng thái bài học. Vui lòng thử lại.');
    } finally {
      setSavingId(null);
    }
  }

  // Compute metric stats for KPI cards
  const stats = useMemo(() => {
    return [
      {
        label: 'Tổng bài học',
        value: allPosts.length,
        icon: BookOpen,
        iconWrap: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      },
      {
        label: 'Chờ duyệt',
        value: allPosts.filter((p) => p.editorialStatus === 'REVIEW').length,
        icon: Clock3,
        iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      },
      {
        label: 'Bản nháp',
        value: allPosts.filter((p) => p.editorialStatus === 'DRAFT').length,
        icon: FileText,
        iconWrap: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      },
      {
        label: 'Đã xuất bản',
        value: allPosts.filter((p) => p.editorialStatus === 'PUBLISHED').length,
        icon: CheckCircle2,
        iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      },
      {
        label: 'Cần cập nhật',
        value: allPosts.filter((p) => p.editorialStatus === 'NEEDS_UPDATE').length,
        icon: AlertCircle,
        iconWrap: 'bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400',
      },
    ];
  }, [allPosts]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      ALL: allPosts.length,
      REVIEW: allPosts.filter((p) => p.editorialStatus === 'REVIEW').length,
      DRAFT: allPosts.filter((p) => p.editorialStatus === 'DRAFT').length,
      PUBLISHED: allPosts.filter((p) => p.editorialStatus === 'PUBLISHED').length,
      NEEDS_UPDATE: allPosts.filter((p) => p.editorialStatus === 'NEEDS_UPDATE').length,
      ARCHIVED: allPosts.filter((p) => p.editorialStatus === 'ARCHIVED').length,
    };
  }, [allPosts]);

  // Filtered list based on active tab and search query
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchTab = activeTab === 'ALL' || post.editorialStatus === activeTab;
      const q = debouncedSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [allPosts, activeTab, debouncedSearch]);

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '--/--/----';
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status: EditorialStatus) => {
    const config = STATUS_CONFIGS.find((s) => s.value === status);
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          config?.badgeClass || 'bg-muted text-muted-foreground'
        }`}
      >
        {config?.label || status}
      </span>
    );
  };

  return (
    <div className="learning-editorial-surface space-y-6">
      {/* 1. Standard Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Duyệt nội dung học tập
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kiểm tra chất lượng biên tập và chuyển trạng thái bài học trước khi xuất bản cho học viên.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/quan-tri/hoc-tap/lo-trinh"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-2xs transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-400"
          >
            <Map className="h-4 w-4" aria-hidden="true" />
            <span>Lộ trình học tập</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadData()}
            disabled={loading}
            className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold text-foreground shadow-2xs hover:bg-muted"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới dữ liệu</span>
          </Button>
        </div>
      </div>

      {/* 2. 5 Metric Summary Cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3.5 rounded-[10px] border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-border/80 dark:bg-card"
            >
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-[10px] ${stat.iconWrap}`}
              >
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

      {/* 3. Main Content Container: Unified Card with Tabs, Toolbar & List */}
      <div className="overflow-hidden rounded-[10px] border border-slate-200/60 bg-white shadow-xs dark:border-border/60 dark:bg-card">
        {/* Horizontal Status Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-100 bg-card px-2 sm:px-4 dark:border-border/40">
          {STATUS_CONFIGS.map((status) => {
            const isActive = activeTab === status.value;
            const count = tabCounts[status.value];
            return (
              <button
                key={status.value}
                type="button"
                onClick={() => setActiveTab(status.value)}
                className={`relative flex shrink-0 items-center gap-2 border-b-2 px-3 py-3.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 font-semibold'
                    : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
                }`}
              >
                <span>{status.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar: Search input & Meta Counters */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-border/40">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài học theo tiêu đề hoặc slug..."
              className="h-10 w-full rounded-[8px] border border-slate-200/80 bg-background pl-9 pr-9 text-sm text-foreground shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-border/60"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Hiển thị <strong className="text-foreground">{filteredPosts.length}</strong> bài học
            </span>
            {search && (
              <span className="rounded bg-muted px-2 py-0.5 text-xs">
                khớp từ khóa &quot;{search}&quot;
              </span>
            )}
          </div>
        </div>

        {/* Content Body: Loading, Empty, or List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium text-muted-foreground">
              Đang đồng bộ dữ liệu bài học học tập…
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          /* Empty State compliant with Rule 22 */
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-50 text-slate-400 dark:bg-muted/40 dark:text-muted-foreground">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
              {search
                ? 'Không tìm thấy bài học nào phù hợp'
                : 'Chưa có bài học ở trạng thái này'}
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              {search
                ? `Không có bài học nào khớp với từ khóa tìm kiếm "${search}". Vui lòng thử lại với từ khóa khác.`
                : 'Hiện tại chưa có bài học nào trong danh mục này cần xử lý. Nội dung mới sẽ xuất hiện tại đây khi tác giả gửi duyệt.'}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {search ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearch('')}
                  className="rounded-lg"
                >
                  Xóa bộ lọc tìm kiếm
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void loadData()}
                    className="gap-2 rounded-lg"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Làm mới dữ liệu</span>
                  </Button>
                  <Link
                    href="/quan-tri/hoc-tap/lo-trinh"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                  >
                    <Map className="h-3.5 w-3.5" />
                    <span>Xem lộ trình học tập</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Lesson List Rows */
          <div className="divide-y divide-slate-100 dark:divide-border/40">
            {filteredPosts.map((post) => {
              const isSaving = savingId === post.id;
              return (
                <article
                  key={post.id}
                  className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/30 lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="hidden sm:grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-heading text-base font-semibold text-foreground">
                          {post.title}
                        </h2>
                        {getStatusBadge(post.editorialStatus)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          {post.slug}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Cập nhật: {formatDate(post.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Status Select */}
                  <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                    <div className="relative">
                      <select
                        value={post.editorialStatus}
                        disabled={isSaving}
                        aria-label={`Trạng thái cho bài học ${post.title}`}
                        onChange={(e) =>
                          void changeStatus(post.id, e.target.value as EditorialStatus)
                        }
                        className="h-10 appearance-none rounded-[8px] border border-slate-200/80 bg-background py-1.5 pl-3 pr-8 text-sm font-semibold text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:opacity-50 dark:border-border/60"
                      >
                        <option value="REVIEW">Chờ duyệt</option>
                        <option value="DRAFT">Bản nháp</option>
                        <option value="PUBLISHED">Đã xuất bản</option>
                        <option value="NEEDS_UPDATE">Cần cập nhật</option>
                        <option value="ARCHIVED">Lưu trữ</option>
                      </select>
                      {isSaving ? (
                        <Loader2 className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 animate-spin text-emerald-600" />
                      ) : (
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    <Link
                      href={`/khoa-hoc/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-10 w-10 place-items-center rounded-[8px] border border-slate-200/80 bg-background text-muted-foreground shadow-2xs transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-border/60 dark:hover:text-emerald-400"
                      title="Xem bài học"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
