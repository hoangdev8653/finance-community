'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight, BookOpen, CalendarDays, CheckCircle2, ChevronDown,
  CircleAlert, FilePlus2, FolderPlus, Layers3, MessageSquareText,
  MoreHorizontal, Sparkles, Users,
} from 'lucide-react';
import { useAdminOverview, useAuditLogs } from '@/lib/admin/use-admin';
import { learningAdminService } from '@/lib/learning/learning-admin-service';
import type { EditorialStatus, LearningAdminPost } from '@/types/learning-admin';

const formatter = new Intl.NumberFormat('vi-VN');

const statusClass: Record<EditorialStatus, string> = {
  PUBLISHED: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  DRAFT: 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300',
  REVIEW: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
  NEEDS_UPDATE: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  ARCHIVED: 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

const statusLabel: Record<EditorialStatus, string> = {
  PUBLISHED: 'Đã xuất bản',
  DRAFT: 'Bản nháp',
  REVIEW: 'Chờ duyệt',
  NEEDS_UPDATE: 'Cần cập nhật',
  ARCHIVED: 'Lưu trữ',
};

function formatDate(value?: string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    : '—';
}

function activityLabel(action: string) {
  return ({
    POST_CREATE: 'Bài viết mới được tạo',
    POST_UPDATE: 'Bài viết đã được cập nhật',
    POST_DELETE: 'Bài viết đã bị xóa',
    MODERATION_APPROVE_POST: 'Bài viết đã được duyệt',
    MODERATION_BAN_POST: 'Bài viết đã bị khóa',
    ROLE_ASSIGN: 'Đã cấp quyền người dùng',
    USER_STATUS_UPDATE: 'Đã cập nhật trạng thái người dùng',
  } as Record<string, string>)[action] || 'Cập nhật hệ thống';
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 96 32" className="h-8 w-24" aria-hidden="true">
      <path
        d="M2 27L15 20L26 22L39 11L49 18L61 14L72 22L84 7L94 10"
        fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Card style tokens for light/dark ── */
const cardClass = 'rounded-xl border border-border bg-card p-5 shadow-card';

function Kpi({
  label, value, helper, Icon, iconClass, background, darkBackground, spark,
}: {
  label: string;
  value?: number;
  helper: string;
  Icon: typeof BookOpen;
  iconClass: string;
  background: string;
  darkBackground: string;
  spark: string;
}) {
  return (
    <section className={`min-h-[132px] ${cardClass}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-12 w-12 place-items-center rounded-full ${background} ${darkBackground}`}>
          <Icon className={`h-6 w-6 ${iconClass}`} aria-hidden="true" />
        </span>
        <p className="pt-1 text-right text-[13px] font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="font-heading text-[26px] font-bold leading-8 tabular-nums text-foreground">
            {value === undefined ? '—' : formatter.format(value)}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            {helper}
          </p>
        </div>
        <Sparkline color={spark} />
      </div>
    </section>
  );
}

export default function AdminOverviewPage() {
  const overviewQuery = useAdminOverview();
  const auditQuery = useAuditLogs({ page: 1, limit: 5 });
  const lessonsQuery = useQuery({
    queryKey: ['learning', 'admin', 'dashboard-lessons'],
    queryFn: () => learningAdminService.getPosts(),
    staleTime: 30_000,
  });

  const overview = overviewQuery.data;
  const activity = auditQuery.data?.data ?? [];
  const lessons = lessonsQuery.data?.data.slice(0, 5) ?? [];
  const breakdown = overview?.postStatusBreakdown ?? { published: 0, draft: 0, unreviewed: 0 };
  const total = breakdown.published + breakdown.draft + breakdown.unreviewed;
  const safeTotal = total || 1;
  const publishedShare = Math.round((breakdown.published / safeTotal) * 100);
  const draftShare = Math.round((breakdown.draft / safeTotal) * 100);
  const points = overview?.postGrowthSeries ?? [];
  const max = Math.max(...points.map(point => point.count), 1);
  const chart = points.length > 1
    ? points.map((point, index) => `${(index / (points.length - 1)) * 100},${90 - (point.count / max) * 72}`).join(' ')
    : '';

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-8 text-foreground">
      {/* ── Header ── */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-[28px] font-bold leading-9 tracking-[-0.02em]">Tổng quan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cái nhìn tổng quan về nền tảng</p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35"
        >
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            7 ngày gần nhất
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </header>

      {/* ── KPI Cards ── */}
      <section aria-label="Chỉ số tổng quan" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Tổng bài viết" value={overview?.totalPosts} helper="Nội dung toàn hệ thống" Icon={BookOpen} iconClass="text-emerald-600 dark:text-emerald-400" background="bg-emerald-50" darkBackground="dark:bg-emerald-950/40" spark="#10b981" />
        <Kpi label="Đã xuất bản" value={breakdown.published} helper="Sẵn sàng cho cộng đồng" Icon={Layers3} iconClass="text-blue-600 dark:text-blue-400" background="bg-blue-50" darkBackground="dark:bg-blue-950/40" spark="#3b82f6" />
        <Kpi label="Người dùng hoạt động" value={overview?.activeUsers} helper="Tài khoản đang hoạt động" Icon={Users} iconClass="text-violet-600 dark:text-violet-400" background="bg-violet-50" darkBackground="dark:bg-violet-950/40" spark="#8b5cf6" />
        <Kpi label="Hàng chờ kiểm duyệt" value={overview?.reviewQueue} helper="Cần xử lý" Icon={MessageSquareText} iconClass="text-orange-500 dark:text-orange-400" background="bg-orange-50" darkBackground="dark:bg-orange-950/40" spark="#f59e0b" />
      </section>

      {/* ── Charts & Activity ── */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(290px,1fr)_minmax(300px,1.1fr)]">
        {/* Content Trends Chart */}
        <article className={cardClass}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold">Xu hướng nội dung</h2>
              <div className="mt-1 flex items-baseline gap-2">
                <strong className="font-heading text-2xl">{formatter.format(overview?.totalPosts ?? 0)}</strong>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Dữ liệu 7 ngày</span>
              </div>
            </div>
            <span className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">7 ngày</span>
          </div>
          <div className="mt-5 h-52">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Biểu đồ xu hướng bài viết trong bảy ngày">
              <defs>
                <linearGradient id="dashboard-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#10b981" stopOpacity=".2" />
                  <stop offset="1" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[18, 42, 66, 90].map(y => (
                <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="currentColor" className="text-border" strokeDasharray="2 2" />
              ))}
              {chart && (
                <>
                  <polygon points={`0,90 ${chart} 100,90`} fill="url(#dashboard-area)" />
                  <polyline points={chart} fill="none" stroke="#10b981" strokeWidth="1.3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
          </div>
          <div className="flex justify-between px-1 text-[11px] text-muted-foreground">
            {points.map(point => <span key={point.date}>{point.label}</span>)}
          </div>
        </article>

        {/* Content Distribution Donut */}
        <article className={cardClass}>
          <h2 className="font-heading text-lg font-bold">Phân bổ nội dung</h2>
          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row xl:flex-col">
            <div
              className="grid h-40 w-40 place-items-center rounded-full"
              style={{ background: `conic-gradient(#10b981 0 ${publishedShare}%, #3b82f6 ${publishedShare}% ${publishedShare + draftShare}%, #f59e0b ${publishedShare + draftShare}% 100%)` }}
            >
              <div className="grid h-24 w-24 place-items-center rounded-full bg-card text-center">
                <span className="text-xs text-muted-foreground">Tổng</span>
                <strong className="font-heading text-xl">{formatter.format(total)}</strong>
              </div>
            </div>
            <div className="w-full space-y-3">
              {[
                ['Đã xuất bản', breakdown.published, 'bg-emerald-500'],
                ['Bản nháp', breakdown.draft, 'bg-blue-500'],
                ['Chờ duyệt', breakdown.unreviewed, 'bg-orange-400'],
              ].map(([label, value, color]) => (
                <div key={String(label)} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <i className={`h-2.5 w-2.5 rounded-full ${color}`} />
                    {label}
                  </span>
                  <span className="text-muted-foreground">{formatter.format(Number(value))}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Recent Activity */}
        <article className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Hoạt động gần đây</h2>
            <Link href="/admin/audit-logs" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35">
              Xem tất cả
            </Link>
          </div>
          <div className="mt-3 divide-y divide-border">
            {activity.length ? activity.map(log => (
              <div key={log.id} className="flex gap-3 py-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{activityLabel(log.action)}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{log.actorEmail || 'Hệ thống'}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">{formatDate(log.createdAt ?? log.created_at)}</p>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center">
                <CircleAlert className="mx-auto h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-foreground">Chưa có hoạt động</p>
                <p className="mt-1 text-xs text-muted-foreground">Các thay đổi quản trị sẽ hiển thị tại đây.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* ── Lessons Table + Quick Actions ── */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
        {/* Lessons Table */}
        <article className={`overflow-hidden ${cardClass} !p-0`}>
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-heading text-lg font-bold">Bài học mới nhất</h2>
            <Link href="/admin/learning" className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35">
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="border-y border-border bg-muted/50 text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Tiêu đề</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Cập nhật</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lessonsQuery.isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-muted-foreground">Đang tải bài học…</td>
                  </tr>
                ) : lessons.length ? lessons.map((lesson: LearningAdminPost) => (
                  <tr key={lesson.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/learning/${lesson.id}`} className="block max-w-[380px] truncate text-sm font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-400">
                        {lesson.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">/{lesson.slug}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusClass[lesson.editorialStatus]}`}>
                        {statusLabel[lesson.editorialStatus]}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-sm text-muted-foreground">{formatDate(lesson.updatedAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        aria-label={`Mở ${lesson.title}`}
                        href={`/admin/learning/${lesson.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35"
                      >
                        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-muted-foreground">Chưa có bài học nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        {/* Quick Actions */}
        <aside className={cardClass}>
          <h2 className="font-heading text-lg font-bold">Thao tác nhanh</h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { href: '/admin/learning/create', label: 'Tạo bài học', Icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400' },
              { href: '/admin/learning/paths', label: 'Tạo series', Icon: Layers3, color: 'text-blue-600 dark:text-blue-400' },
              { href: '/admin/learning/categories', label: 'Tạo danh mục', Icon: FolderPlus, color: 'text-orange-500 dark:text-orange-400' },
              { href: '/admin/moderation', label: 'Duyệt bài viết', Icon: FilePlus2, color: 'text-violet-600 dark:text-violet-400' },
              { href: '/admin/users', label: 'Người dùng', Icon: Users, color: 'text-blue-600 dark:text-blue-400' },
              { href: '/admin/settings', label: 'Cấu hình', Icon: Sparkles, color: 'text-sky-600 dark:text-sky-400' },
            ].map(({ href, label, Icon, color }) => (
              <Link
                key={label}
                href={href}
                className="flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-lg border border-border text-center text-xs font-medium text-foreground transition-colors hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35"
              >
                <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
