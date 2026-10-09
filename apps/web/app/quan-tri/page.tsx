'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUp,
  BarChart2,
  BookOpen,
  Calendar,
  ChevronDown,
  FileCheck,
  FileText,
  MessageCircle,
  Plus,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { useAdminOverview, useAdminUsers, useAuditLogs } from '@/lib/admin/use-admin';
import { adminService } from '@/lib/admin/admin-service';
import { learningCourseService } from '@/lib/learning/learning-course-service';
import { postsService } from '@/lib/posts/posts-service';
import type { AdminUserEntity, AuditLogEntity } from '@/types/admin';

// Number formatter
const formatter = new Intl.NumberFormat('vi-VN');

function formatDate(value?: string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    : '—';
}

function formatDateKey(value?: string | null) {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : '—';
}

function formatRelativeTime(dateString?: string | null) {
  if (!dateString) return 'Vừa xong';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Vừa xong';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
}

function activityLabel(action: string) {
  return ({
    POST_CREATE: 'Đã đăng bài viết mới',
    POST_UPDATE: 'Đã cập nhật bài học',
    POST_DELETE: 'Bài viết đã bị xóa',
    MODERATION_APPROVE_POST: 'Bài viết đã được duyệt',
    MODERATION_BAN_POST: 'Bài viết đã bị khóa',
    ROLE_ASSIGN: 'Đã cấp quyền người dùng',
    USER_STATUS_UPDATE: 'Đã cập nhật trạng thái người dùng',
  } as Record<string, string>)[action] || 'Cập nhật hệ thống';
}

function getQueryErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
    if (Array.isArray(message) && message.length) return message.join(', ');
  }
  return fallback;
}

export default function AdminOverviewPage() {
  const [postViewsDays, setPostViewsDays] = useState<1 | 7 | 30>(7);
  const isMonthlyRange = postViewsDays === 30;
  const [userRoleDays, setUserRoleDays] = useState<1 | 7 | 30>(7);
  // Real database queries
  const overviewQuery = useAdminOverview();
  const trafficQuery = useQuery({
    queryKey: ['admin', 'analytics', 'post-views', postViewsDays],
    queryFn: () => adminService.getPostViews(postViewsDays, isMonthlyRange ? 'previous-month' : undefined),
    staleTime: 30_000,
  });
  const userRoleQuery = useQuery({
    queryKey: ['admin', 'analytics', 'user-roles', userRoleDays],
    queryFn: () => adminService.getUserRoleComposition(userRoleDays),
    staleTime: 30_000,
  });
  const auditQuery = useAuditLogs({ page: 1, limit: 5 });
  const usersQuery = useAdminUsers({ page: 1, limit: 5 });
  const coursesQuery = useQuery({
    queryKey: ['learning', 'admin', 'dashboard-courses'],
    queryFn: () => learningCourseService.list(),
    staleTime: 30_000,
  });
  const categoriesQuery = useQuery({
    queryKey: ['admin', 'dashboard-course-categories'],
    queryFn: () => postsService.getCategories(),
    staleTime: 30_000,
  });

  const overview = overviewQuery.data;
  const realCourses = [...(coursesQuery.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const categoryNames = new Map(
    (categoriesQuery.data ?? []).map((category) => [category.id, category.nameVi || category.name]),
  );
  const realUsers = usersQuery.data?.data ?? [];
  const realAudit = auditQuery.data?.data ?? [];
  const trafficSeries = trafficQuery.data?.series ?? [];
  const trafficRangeLabel = trafficQuery.data
    ? `${formatDateKey(trafficQuery.data.rangeStart)} – ${formatDateKey(trafficQuery.data.rangeEndExclusive)}`
    : '';
  const chartMax = Math.max(4, ...trafficSeries.map((point) => point.views));
  const chartPoints = trafficSeries.map((point, index) => ({
    ...point,
    x: trafficSeries.length <= 1 ? 250 : 20 + (460 * index) / (trafficSeries.length - 1),
    y: 180 - (160 * point.views) / chartMax,
  }));
  const chartLine = chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const chartArea = chartPoints.length
    ? `${chartLine} L ${chartPoints[chartPoints.length - 1].x} 190 L ${chartPoints[0].x} 190 Z`
    : '';
  const axisValues = [chartMax, Math.round(chartMax * 0.75), Math.round(chartMax * 0.5), Math.round(chartMax * 0.25), 0];
  const compactCount = (value: number) => value >= 1000 ? `${Math.round(value / 100) / 10}K` : String(value);
  const roleColors = ['#00B074', '#3B82F6', '#8B5CF6', '#F59E0B'];
  const roleCircumference = 2 * Math.PI * 60;
  let roleOffset = 0;
  const roleChartSegments = (userRoleQuery.data?.roles ?? []).map((role, index) => {
    const length = userRoleQuery.data!.totalUsers > 0
      ? (role.count / userRoleQuery.data!.totalUsers) * roleCircumference
      : 0;
    const segment = { ...role, color: roleColors[index % roleColors.length], length, offset: roleOffset };
    roleOffset += length;
    return segment;
  });

  // KPI metrics from the admin and learning APIs.
  const stats = [
    {
      label: 'Tổng người dùng',
      value: usersQuery.data?.meta?.totalItems !== undefined ? formatter.format(usersQuery.data.meta.totalItems) : '—',
      trend: '12%',
      isUp: true,
      icon: Users,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
    {
      label: 'Tổng khóa học',
      value: coursesQuery.data ? formatter.format(realCourses.length) : '—',
      trend: '8%',
      isUp: true,
      icon: BookOpen,
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    },
    {
      label: 'Tổng bài viết',
      value: overview ? formatter.format(overview.totalPosts) : '—',
      trend: '15%',
      isUp: true,
      icon: FileText,
      iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
    },
    {
      label: 'Bình luận',
      value: overview?.totalComments !== undefined ? formatter.format(overview.totalComments) : '—',
      trend: '22%',
      isUp: true,
      icon: MessageCircle,
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
      hasPlantAccent: true,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header: Welcome + Date Filter ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px] dark:text-white">
            Chào mừng trở lại, Admin!
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Cùng theo dõi và quản lý nền tảng Finance Community.
          </p>
        </div>

        {/* Date Selector */}
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2.5 rounded-[10px] border border-slate-200/90 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span>Hôm nay, {new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(new Date())}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </button>
      </div>

      {/* ── Row 1: 4 KPI Cards matching dashboard.png horizontal layout ── */}
      <section aria-label="Chỉ số chính" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="relative flex min-h-[128px] items-center overflow-hidden rounded-[10px] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] ${stat.iconBg}`}>
                  <Icon className="h-7 w-7" strokeWidth={2.1} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <h2 className="mt-0.5 font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-[26px] dark:text-white">
                    {stat.value}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#00B074]">
                    <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                    <span>{stat.trend}</span>
                    <span className="font-normal text-slate-400 dark:text-slate-500">so với tháng trước</span>
                  </p>
                </div>
              </div>

              {/* Decorative Potted Plant in 4th Card matching dashboard.png */}
              {stat.hasPlantAccent && (
                <div className="pointer-events-none absolute -bottom-1 right-2 h-28 w-24">
                  <img
                    src="/images/admin-card-plant.png"
                    alt="Potted plant illustration"
                    className="h-full w-full object-contain mix-blend-multiply drop-shadow-sm dark:mix-blend-normal"
                  />
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ── Main Layout: 2 Columns (72% / 28%) ── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* ── LEFT COLUMN: Charts & Tables (Col Span 8) ── */}
        <div className="space-y-6 xl:col-span-8">
          {/* Charts Row: Platform Traffic & User Composition */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Box 1: Lượt xem bài viết */}
            <div className="rounded-[10px] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Lượt xem bài viết
                </h2>
                <div className="relative">
                  <select
                    aria-label="Lọc lượt xem bài viết theo thời gian"
                    value={postViewsDays}
                    onChange={(event) => setPostViewsDays(Number(event.target.value) as 1 | 7 | 30)}
                    className="h-9 appearance-none rounded-[10px] border border-slate-200/80 bg-slate-50/50 py-1.5 pl-3 pr-8 text-xs font-medium text-slate-600 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <option value={1}>1 ngày qua</option>
                    <option value={7}>7 ngày qua</option>
                    <option value={30}>30 ngày qua</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {trafficQuery.isError
                  ? getQueryErrorMessage(trafficQuery.error, 'Không tải được dữ liệu lượt xem bài viết.')
                  : isMonthlyRange
                    ? `${trafficRangeLabel} · ${formatter.format(trafficQuery.data?.totalPostViews ?? 0)} lượt xem bài viết`
                    : `${formatter.format(trafficQuery.data?.totalPostViews ?? 0)} lượt xem bài viết trong ${postViewsDays} ngày qua`}
              </div>
              <div className="relative mt-6 h-56 w-full" aria-label={`Biểu đồ lượt xem bài viết trong ${isMonthlyRange ? 'khoảng tháng đã chọn' : `${postViewsDays} ngày gần nhất`}`}>
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between text-[11px] font-medium text-slate-400" aria-hidden="true">
                  {axisValues.map((value, index) => (
                    <div key={`${value}-${index}`} className="flex items-center gap-2">
                      <span className="w-7 text-right">{compactCount(value)}</span>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                  ))}
                </div>
                <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full pl-9 pr-2" role="img" aria-label="Lượt xem bài viết mỗi ngày">
                  <defs>
                    <linearGradient id="traffic-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00B074" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#00B074" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {chartArea && <path d={chartArea} fill="url(#traffic-gradient)" />}
                  {chartLine && <path d={chartLine} fill="none" stroke="#00B074" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />}
                  {chartPoints.map((point, index) => (
                    <circle key={point.date} cx={point.x} cy={point.y} r={index === chartPoints.length - 1 ? 5 : 4} fill="#00B074" stroke={index === chartPoints.length - 1 ? '#FFFFFF' : 'none'} strokeWidth="2">
                      <title>{`${point.label}: ${formatter.format(point.views)} lượt xem bài viết`}</title>
                    </circle>
                  ))}
                </svg>
                {trafficQuery.isLoading && <p className="absolute inset-x-10 top-1/2 text-center text-xs text-slate-400">Đang tải dữ liệu…</p>}
                {!trafficQuery.isLoading && trafficSeries.length > 0 && !isMonthlyRange && (
                  <div className="absolute right-3 top-2 z-10 rounded-[10px] border border-slate-100 bg-white/95 px-3 py-2 shadow-lg shadow-slate-200/50 backdrop-blur dark:border-slate-700 dark:bg-slate-800/95 dark:shadow-none">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{trafficSeries[trafficSeries.length - 1].label}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                      <span className="h-2 w-2 rounded-full bg-[#00B074]" />
                      <span>{formatter.format(trafficSeries[trafficSeries.length - 1].views)}</span>
                      <span className="font-normal text-slate-500 dark:text-slate-400">lượt xem bài viết</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between gap-1 pl-9 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {isMonthlyRange
                  ? <><span>{formatDateKey(trafficQuery.data?.rangeStart).slice(0, 5)}</span><span>{formatDateKey(trafficQuery.data?.rangeEndExclusive).slice(0, 5)}</span></>
                  : trafficSeries.map((point, index) => (
                    <span key={point.date} className={index === trafficSeries.length - 1 ? 'font-bold text-[#00B074]' : ''}>{point.label}</span>
                  ))}
              </div>
            </div>

            {/* Box 2: Cơ cấu người dùng */}
            <div className="rounded-[10px] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Cơ cấu người dùng
                </h2>
                <div className="relative">
                  <select
                    aria-label="Lọc cơ cấu người dùng theo thời gian"
                    value={userRoleDays}
                    onChange={(event) => setUserRoleDays(Number(event.target.value) as 1 | 7 | 30)}
                    className="h-9 appearance-none rounded-[10px] border border-slate-200/80 bg-slate-50/50 py-1.5 pl-3 pr-8 text-xs font-medium text-slate-600 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <option value={1}>1 ngày qua</option>
                    <option value={7}>7 ngày qua</option>
                    <option value={30}>30 ngày qua</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Donut Chart & Legend */}
              <div className="mt-6 flex flex-col items-center justify-around gap-6 sm:flex-row">
                {/* SVG Donut */}
                <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                    {/* Background Ring */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#F1F5F9"
                      strokeWidth="22"
                      className="dark:stroke-slate-800"
                    />
                    {roleChartSegments.map((segment) => (
                      <circle
                        key={segment.key}
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke={segment.color}
                        strokeWidth="22"
                        strokeDasharray={`${segment.length} ${roleCircumference - segment.length}`}
                        strokeDashoffset={-segment.offset}
                        strokeLinecap="butt"
                      >
                        <title>{`${segment.label}: ${segment.count} người dùng`}</title>
                      </circle>
                    ))}
                  </svg>

                  {/* Center Text */}
                  <div className="absolute text-center">
                    <span className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {userRoleQuery.data ? formatter.format(userRoleQuery.data.totalUsers) : '—'}
                    </span>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">trong {userRoleDays} ngày qua</p>
                  </div>
                </div>

                {/* Legend */}
                <div className="w-full max-w-[180px] space-y-3.5">
                  {roleChartSegments.map((segment) => {
                    const percent = userRoleQuery.data?.totalUsers
                      ? Math.round((segment.count / userRoleQuery.data.totalUsers) * 100)
                      : 0;
                    return (
                      <div key={segment.key} className="flex items-center justify-between gap-3 text-xs font-semibold">
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
                          {segment.label}
                        </span>
                        <span className="text-slate-900 dark:text-white">{userRoleQuery.isError ? '—' : `${percent}%`}</span>
                      </div>
                    );
                  })}
                  {userRoleQuery.isLoading && <p className="text-xs text-slate-400">Đang tải vai trò…</p>}
                  {userRoleQuery.isError && <p className="text-xs text-rose-500">{getQueryErrorMessage(userRoleQuery.error, 'Không tải được cơ cấu người dùng.')}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Tables Row: Latest Courses & New Users */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            {/* Box 3: Lộ trình học mới nhất */}
            <div className="self-start overflow-hidden rounded-[10px] border border-slate-100 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
              <div className="flex items-center justify-between p-5 pb-3">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Lộ trình học mới nhất
                </h2>
                <Link
                  href="/quan-tri/hoc-tap"
                  className="group inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-y border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500">
                    <tr>
                      <th className="py-2.5 pl-5 pr-2">#</th>
                      <th className="py-2.5 px-3">Tiêu đề</th>
                      <th className="hidden py-2.5 px-3 md:table-cell">Danh mục</th>
                      <th className="hidden py-2.5 px-3 sm:table-cell">Ngày tạo</th>
                      <th className="whitespace-nowrap py-2.5 pl-3 pr-5 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {realCourses.slice(0, 5).map((course, index) => (
                      <tr key={course.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-3 pl-5 pr-2 font-medium text-slate-400">{index + 1}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-700 text-white shadow-sm">
                              <BookOpen className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <span className="line-clamp-1 font-semibold text-slate-800 dark:text-slate-200">{course.title}</span>
                          </div>
                        </td>
                        <td className="hidden py-3 px-3 text-slate-500 md:table-cell dark:text-slate-400">{categoryNames.get(course.categoryId) || '—'}</td>
                        <td className="hidden py-3 px-3 text-slate-400 sm:table-cell">{formatDate(course.createdAt)}</td>
                        <td className="py-3 pl-3 pr-5 text-right">
                          <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-semibold ${course.isPublished ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                            {course.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!coursesQuery.isLoading && realCourses.length === 0 && (
                      <tr><td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-500">Chưa có lộ trình học nào.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Box 4: Người dùng mới nhất */}
            <div className="h-auto self-start overflow-hidden rounded-[10px] border border-slate-100 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
              <div className="flex items-center justify-between p-5 pb-3">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Người dùng mới nhất
                </h2>
                <Link
                  href="/quan-tri/nguoi-dung"
                  className="group inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-y border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500">
                    <tr>
                      <th className="py-2.5 pl-5 pr-3">Người dùng</th>
                      <th className="py-2.5 px-3">Vai trò</th>
                      <th className="py-2.5 pl-3 pr-5 text-right">Ngày tham gia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {realUsers.length > 0 ? (
                      realUsers.slice(0, 5).map((u: AdminUserEntity) => (
                        <tr key={u.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-3 pl-5 pr-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                                {(u.displayName || u.username || u.email || 'U')[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-800 dark:text-slate-200">
                                  {u.displayName || u.username || 'Người dùng'}
                                </p>
                                <p className="truncate text-[11px] text-slate-400">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                              {u.roles?.includes('ADMIN') || u.roles?.includes('SUPER_ADMIN')
                                ? 'Quản trị viên'
                                : u.roles?.includes('MODERATOR')
                                ? 'Kiểm duyệt'
                                : 'Học viên'}
                            </span>
                          </td>
                          <td className="py-3 pl-3 pr-5 text-right text-slate-400">
                            {formatDate(u.createdAt)}
                          </td>
                        </tr>
                      ))
                    ) : !usersQuery.isLoading ? (
                      <tr><td colSpan={3} className="px-5 py-8 text-center text-xs text-slate-500">Chưa có người dùng.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Growth Banner, Quick Actions, Recent Activity (Col Span 4) ── */}
        <div className="space-y-6 xl:col-span-4">
          {/* Card 1: Nền tảng đang phát triển tốt! Banner */}
          <div className="relative overflow-hidden rounded-[10px] border border-emerald-100/90 bg-gradient-to-br from-emerald-50/90 via-emerald-50/50 to-teal-50/30 p-5 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-slate-900">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#00B074] text-white shadow-md shadow-emerald-600/20">
                <TrendingUp className="h-6 w-6" strokeWidth={2.3} />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                  Nền tảng đang phát triển tốt!
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  Số lượng người dùng tăng 12% so với tháng trước. Hãy tiếp tục duy trì chất lượng nội dung nhé!
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Thao tác nhanh (Quick Actions) */}
          <div className="rounded-[10px] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
            <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
              Thao tác nhanh
            </h2>

            <div className="mt-4 space-y-2.5">
              {/* Button 1: Tạo khóa học mới */}
              <Link
                href="/quan-tri/hoc-tap"
                className="group flex h-12 w-full items-center gap-3 rounded-[10px] border border-slate-200/80 bg-white px-4 text-xs font-semibold text-slate-700 transition-all hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span>Tạo khóa học mới</span>
              </Link>

              {/* Button 2: Duyệt bài viết (số lượng từ API overview) */}
              <Link
                href="/quan-tri/kiem-duyet"
                className="group flex h-12 w-full items-center justify-between rounded-[10px] border border-slate-200/80 bg-white px-4 text-xs font-semibold text-slate-700 transition-all hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <FileText className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <span>Duyệt bài viết</span>
                </div>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
                  {overview?.reviewQueue ?? 0}
                </span>
              </Link>

              {/* Button 3: Quản lý người dùng */}
              <Link
                href="/quan-tri/nguoi-dung"
                className="group flex h-12 w-full items-center gap-3 rounded-[10px] border border-slate-200/80 bg-white px-4 text-xs font-semibold text-slate-700 transition-all hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <User className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span>Quản lý người dùng</span>
              </Link>

              {/* Button 4: Xem báo cáo chi tiết */}
              <Link
                href="/quan-tri/nhat-ky-he-thong"
                className="group flex h-12 w-full items-center gap-3 rounded-[10px] border border-slate-200/80 bg-white px-4 text-xs font-semibold text-slate-700 transition-all hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <BarChart2 className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span>Xem báo cáo chi tiết</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Hoạt động gần đây (Recent Activities from Audit Logs or fallback) */}
          <div className="rounded-[10px] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-2">
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Hoạt động gần đây
              </h2>
              <Link
                href="/quan-tri/nhat-ky-he-thong"
                className="group inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {realAudit.length > 0 ? (
                realAudit.slice(0, 5).map((log: AuditLogEntity) => (
                  <div key={log.id} className="flex items-start gap-3 py-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <FileCheck className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 text-xs">
                      <p className="text-slate-700 dark:text-slate-200">
                        <strong className="font-bold text-slate-900 dark:text-white">
                          {log.actorEmail || 'Hệ thống'}
                        </strong>{' '}
                        {activityLabel(log.action)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {formatRelativeTime(log.created_at || log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : !auditQuery.isLoading ? (
                <p className="py-6 text-center text-xs text-slate-500">Chưa có hoạt động quản trị gần đây.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
