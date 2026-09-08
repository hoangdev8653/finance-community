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
  FileEdit,
  FileText,
  MessageCircle,
  MessageSquare,
  Plus,
  TrendingUp,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAdminOverview, useAdminUsers, useAuditLogs } from '@/lib/admin/use-admin';
import { learningAdminService } from '@/lib/learning/learning-admin-service';
import type { EditorialStatus, LearningAdminPost } from '@/types/learning-admin';
import type { AdminUserEntity, AuditLogEntity } from '@/types/admin';

// Number formatter
const formatter = new Intl.NumberFormat('vi-VN');

// Editorial status mappings
const editorialStatusLabel: Record<EditorialStatus, string> = {
  PUBLISHED: 'Đã xuất bản',
  DRAFT: 'Bản nháp',
  REVIEW: 'Chờ duyệt',
  NEEDS_UPDATE: 'Cần cập nhật',
  ARCHIVED: 'Lưu trữ',
};

const editorialBadgeClass: Record<EditorialStatus, string> = {
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  DRAFT: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  REVIEW: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  NEEDS_UPDATE: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
  ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

function formatDate(value?: string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    : '—';
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

// Fallback reference data
const referenceCourses = [
  {
    id: 'ref-1',
    title: 'Quản lý tài chính cá nhân cho người mới',
    instructor: 'Nguyễn Văn A',
    category: 'Tài chính cá nhân',
    date: '05/09/2025',
    status: 'Đã xuất bản',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    thumbGradient: 'from-emerald-600 to-teal-700',
    thumbIcon: '📈',
  },
  {
    id: 'ref-2',
    title: 'Đầu tư chứng khoán thực chiến A-Z',
    instructor: 'Trần Thị B',
    category: 'Đầu tư',
    date: '04/09/2025',
    status: 'Đã xuất bản',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    thumbGradient: 'from-blue-600 to-indigo-700',
    thumbIcon: '📊',
  },
  {
    id: 'ref-3',
    title: 'Excel tài chính ứng dụng thực tế',
    instructor: 'Lê Minh C',
    category: 'Công cụ',
    date: '03/09/2025',
    status: 'Chờ duyệt',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    thumbGradient: 'from-green-600 to-emerald-800',
    thumbIcon: '📑',
  },
  {
    id: 'ref-4',
    title: 'Tư duy tài chính dài hạn',
    instructor: 'Phạm Thu D',
    category: 'Tư duy',
    date: '02/09/2025',
    status: 'Đã xuất bản',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    thumbGradient: 'from-violet-600 to-purple-800',
    thumbIcon: '🧠',
  },
  {
    id: 'ref-5',
    title: 'Crypto từ cơ bản đến nâng cao',
    instructor: 'Hoàng Văn E',
    category: 'Đầu tư',
    date: '01/09/2025',
    status: 'Đã xuất bản',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    thumbGradient: 'from-amber-600 to-orange-700',
    thumbIcon: '🪙',
  },
];

const referenceUsers = [
  {
    id: 'u-1',
    name: 'Nguyễn Hoàng An',
    email: 'an.nguyen@email.com',
    role: 'Học viên',
    roleClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    date: '06/09/2025',
    avatarBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'u-2',
    name: 'Trần Minh Thư',
    email: 'thu.tran@email.com',
    role: 'Học viên',
    roleClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    date: '06/09/2025',
    avatarBg: 'bg-rose-100 text-rose-700',
  },
  {
    id: 'u-3',
    name: 'Lê Quang Huy',
    email: 'huy.le@email.com',
    role: 'Giảng viên',
    roleClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    date: '05/09/2025',
    avatarBg: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'u-4',
    name: 'Phạm Bảo Ngọc',
    email: 'ngoc.pham@email.com',
    role: 'Học viên',
    roleClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    date: '05/09/2025',
    avatarBg: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'u-5',
    name: 'Đặng Tuấn Anh',
    email: 'anh.dang@email.com',
    role: 'Chuyên gia',
    roleClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    date: '04/09/2025',
    avatarBg: 'bg-purple-100 text-purple-700',
  },
];

const referenceActivities = [
  { id: 'act-1', actor: 'Nguyễn Văn A', text: 'đã đăng khóa học mới', time: '2 phút trước', icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400' },
  { id: 'act-2', actor: 'Trần Thị B', text: 'đã cập nhật bài học', time: '15 phút trước', icon: FileEdit, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400' },
  { id: 'act-3', actor: 'Lê Minh C', text: 'đã bình luận', time: '32 phút trước', icon: MessageSquare, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400' },
  { id: 'act-4', actor: '', text: 'Người dùng mới đăng ký: Nguyễn Hoàng An', time: '1 giờ trước', icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400' },
  { id: 'act-5', actor: '', text: 'Bài viết cần duyệt: “Có nên đầu tư vàng…”', time: '2 giờ trước', icon: FileCheck, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50 dark:text-orange-400' },
];

export default function AdminOverviewPage() {
  // Real database queries
  const overviewQuery = useAdminOverview();
  const auditQuery = useAuditLogs({ page: 1, limit: 5 });
  const usersQuery = useAdminUsers({ page: 1, limit: 5 });
  const lessonsQuery = useQuery({
    queryKey: ['learning', 'admin', 'dashboard-lessons'],
    queryFn: () => learningAdminService.getPosts(),
    staleTime: 30_000,
  });

  const overview = overviewQuery.data;
  const realLessons = lessonsQuery.data?.data ?? [];
  const realUsers = usersQuery.data?.data ?? [];
  const realAudit = auditQuery.data?.data ?? [];

  // Dropdown states
  const [trafficPeriod] = useState('7 ngày qua');
  const [userSegment] = useState('Tất cả');

  // KPI Metrics (real data with fallback)
  const stats = [
    {
      label: 'Tổng người dùng',
      value: overview?.activeUsers ? formatter.format(overview.activeUsers) : '12,589',
      trend: '12%',
      isUp: true,
      icon: Users,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
    {
      label: 'Tổng khóa học',
      value: overview?.totalPosts ? formatter.format(overview.totalPosts) : '1,248',
      trend: '8%',
      isUp: true,
      icon: BookOpen,
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    },
    {
      label: 'Tổng bài viết',
      value: overview?.postStatusBreakdown ? formatter.format(
        overview.postStatusBreakdown.published + overview.postStatusBreakdown.draft + overview.postStatusBreakdown.unreviewed
      ) : '3,560',
      trend: '15%',
      isUp: true,
      icon: FileText,
      iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
    },
    {
      label: 'Bình luận',
      value: overview?.totalComments ? formatter.format(overview.totalComments) : '18,942',
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
          className="inline-flex h-11 items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span>Hôm nay, 06 Tháng 9, 2025</span>
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
              className="relative flex min-h-[128px] items-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg}`}>
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
            {/* Box 1: Lượt truy cập nền tảng */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Lượt truy cập nền tảng
                </h2>
                <div className="relative inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <span>{trafficPeriod}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Area Line Chart with Smooth Spline Curve & Highlighted Tooltip */}
              <div className="relative mt-6 h-56 w-full">
                {/* Y-axis Guides */}
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between text-[11px] font-medium text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-7 text-right">20K</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-7 text-right">15K</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-7 text-right">10K</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-7 text-right">5K</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-7 text-right">0</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>

                {/* SVG Curves */}
                <svg
                  viewBox="0 0 500 200"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full pl-9 pr-2"
                >
                  <defs>
                    <linearGradient id="traffic-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00B074" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#00B074" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Shaded Area Under Curve */}
                  <path
                    d="M 20 160 
                       C 50 150, 60 130, 90 130 
                       C 120 130, 130 150, 160 150 
                       C 190 150, 210 100, 240 100 
                       C 270 100, 290 100, 320 100 
                       C 350 100, 370 70, 400 70 
                       C 430 70, 450 85, 480 40 
                       L 480 190 L 20 190 Z"
                    fill="url(#traffic-gradient)"
                  />

                  {/* Main Smooth Line */}
                  <path
                    d="M 20 160 
                       C 50 150, 60 130, 90 130 
                       C 120 130, 130 150, 160 150 
                       C 190 150, 210 100, 240 100 
                       C 270 100, 290 100, 320 100 
                       C 350 100, 370 70, 400 70 
                       C 430 70, 450 85, 480 40"
                    fill="none"
                    stroke="#00B074"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Dotted line to 05/09 */}
                  <line
                    x1="400"
                    y1="70"
                    x2="400"
                    y2="190"
                    stroke="#00B074"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Data Points */}
                  <circle cx="20" cy="160" r="4.5" fill="#00B074" />
                  <circle cx="90" cy="130" r="4.5" fill="#00B074" />
                  <circle cx="160" cy="150" r="4.5" fill="#00B074" />
                  <circle cx="240" cy="100" r="4.5" fill="#00B074" />
                  <circle cx="320" cy="100" r="4.5" fill="#00B074" />
                  <circle cx="400" cy="70" r="5" fill="#00B074" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="480" cy="40" r="4.5" fill="#00B074" />
                </svg>

                {/* Floating Tooltip matching dashboard.png */}
                <div className="absolute right-12 top-6 z-10 rounded-xl border border-slate-100 bg-white/95 px-3 py-2 shadow-lg shadow-slate-200/50 backdrop-blur dark:border-slate-700 dark:bg-slate-800/95 dark:shadow-none">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">05/09/2025</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                    <span className="h-2 w-2 rounded-full bg-[#00B074]" />
                    <span>12,580</span>
                    <span className="font-normal text-slate-500 dark:text-slate-400">lượt truy cập</span>
                  </p>
                </div>
              </div>

              {/* X-axis Dates */}
              <div className="mt-4 flex justify-between pl-9 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                <span>31/08</span>
                <span>01/09</span>
                <span>02/09</span>
                <span>03/09</span>
                <span>04/09</span>
                <span className="font-bold text-[#00B074]">05/09</span>
                <span>06/09</span>
              </div>
            </div>

            {/* Box 2: Cơ cấu người dùng */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Cơ cấu người dùng
                </h2>
                <div className="relative inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <span>{userSegment}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
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
                    {/* Học viên: 68% */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#00B074"
                      strokeWidth="22"
                      strokeDasharray="256 377"
                      strokeDashoffset="0"
                      strokeLinecap="butt"
                    />
                    {/* Giảng viên: 12% */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="22"
                      strokeDasharray="45 377"
                      strokeDashoffset="-256"
                      strokeLinecap="butt"
                    />
                    {/* Chuyên gia: 8% */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="22"
                      strokeDasharray="30 377"
                      strokeDashoffset="-301"
                      strokeLinecap="butt"
                    />
                    {/* Khác: 12% */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="22"
                      strokeDasharray="45 377"
                      strokeDashoffset="-331"
                      strokeLinecap="butt"
                    />
                  </svg>

                  {/* Center Text */}
                  <div className="absolute text-center">
                    <span className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {overview?.activeUsers ? formatter.format(overview.activeUsers) : '12,589'}
                    </span>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      người dùng
                    </p>
                  </div>
                </div>

                {/* Legend */}
                <div className="w-full max-w-[160px] space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#00B074]" />
                      Học viên
                    </span>
                    <span className="text-slate-900 dark:text-white">68%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
                      Giảng viên
                    </span>
                    <span className="text-slate-900 dark:text-white">12%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />
                      Chuyên gia
                    </span>
                    <span className="text-slate-900 dark:text-white">8%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                      Khác
                    </span>
                    <span className="text-slate-900 dark:text-white">12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tables Row: Latest Courses & New Users */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Box 3: Khóa học mới nhất */}
            <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
              <div className="flex items-center justify-between p-5 pb-3">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Khóa học mới nhất
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
                      <th className="hidden py-2.5 px-3 sm:table-cell">Giảng viên</th>
                      <th className="hidden py-2.5 px-3 md:table-cell">Danh mục</th>
                      <th className="hidden py-2.5 px-3 sm:table-cell">Ngày tạo</th>
                      <th className="py-2.5 pl-3 pr-5 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {/* If database has posts, render real posts. Otherwise render reference courses */}
                    {realLessons.length > 0 ? (
                      realLessons.slice(0, 5).map((lesson: LearningAdminPost, index: number) => (
                        <tr key={lesson.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-3 pl-5 pr-2 font-medium text-slate-400">{index + 1}</td>
                          <td className="py-3 px-3">
                            <Link
                              href={`/quan-tri/hoc-tap/${lesson.id}`}
                              className="flex items-center gap-2.5 group"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-700 text-sm text-white shadow-sm">
                                📚
                              </div>
                              <span className="line-clamp-1 font-semibold text-slate-800 transition-colors group-hover:text-emerald-600 dark:text-slate-200 dark:group-hover:text-emerald-400">
                                {lesson.title}
                              </span>
                            </Link>
                          </td>
                          <td className="hidden py-3 px-3 text-slate-500 sm:table-cell dark:text-slate-400">
                            Ban biên tập
                          </td>
                          <td className="hidden py-3 px-3 text-slate-500 md:table-cell dark:text-slate-400">
                            Khóa học
                          </td>
                          <td className="hidden py-3 px-3 text-slate-400 sm:table-cell">
                            {formatDate(lesson.createdAt)}
                          </td>
                          <td className="py-3 pl-3 pr-5 text-right">
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${editorialBadgeClass[lesson.editorialStatus] || 'bg-slate-50 text-slate-600'}`}>
                              {editorialStatusLabel[lesson.editorialStatus] || lesson.editorialStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      referenceCourses.map((course, idx) => (
                        <tr key={course.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-3 pl-5 pr-2 font-medium text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr ${course.thumbGradient} text-sm shadow-sm`}>
                                {course.thumbIcon}
                              </div>
                              <span className="line-clamp-1 font-semibold text-slate-800 dark:text-slate-200">
                                {course.title}
                              </span>
                            </div>
                          </td>
                          <td className="hidden py-3 px-3 text-slate-500 sm:table-cell dark:text-slate-400">
                            {course.instructor}
                          </td>
                          <td className="hidden py-3 px-3 text-slate-500 md:table-cell dark:text-slate-400">
                            {course.category}
                          </td>
                          <td className="hidden py-3 px-3 text-slate-400 sm:table-cell">
                            {course.date}
                          </td>
                          <td className="py-3 pl-3 pr-5 text-right">
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${course.badgeClass}`}>
                              {course.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Box 4: Người dùng mới nhất */}
            <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
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
                    ) : (
                      referenceUsers.map((user) => (
                        <tr key={user.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-3 pl-5 pr-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-xs ${user.avatarBg}`}>
                                {user.name.split(' ').pop()?.[0] || 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-800 dark:text-slate-200">
                                  {user.name}
                                </p>
                                <p className="truncate text-[11px] text-slate-400">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${user.roleClass}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 pl-3 pr-5 text-right text-slate-400">
                            {user.date}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Growth Banner, Quick Actions, Recent Activity (Col Span 4) ── */}
        <div className="space-y-6 xl:col-span-4">
          {/* Card 1: Nền tảng đang phát triển tốt! Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100/90 bg-gradient-to-br from-emerald-50/90 via-emerald-50/50 to-teal-50/30 p-5 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-slate-900">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00B074] text-white shadow-md shadow-emerald-600/20">
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
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
            <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
              Thao tác nhanh
            </h2>

            <div className="mt-4 space-y-2.5">
              {/* Button 1: Tạo khóa học mới */}
              <Link
                href="/quan-tri/hoc-tap"
                className="group flex h-12 w-full items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 text-xs font-semibold text-slate-700 transition-all hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span>Tạo khóa học mới</span>
              </Link>

              {/* Button 2: Duyệt bài viết (with Badge count from reviewQueue or 12) */}
              <Link
                href="/quan-tri/kiem-duyet"
                className="group flex h-12 w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 text-xs font-semibold text-slate-700 transition-all hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <FileText className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <span>Duyệt bài viết</span>
                </div>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
                  {overview?.reviewQueue ?? 12}
                </span>
              </Link>

              {/* Button 3: Quản lý người dùng */}
              <Link
                href="/quan-tri/nguoi-dung"
                className="group flex h-12 w-full items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 text-xs font-semibold text-slate-700 transition-all hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <User className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span>Quản lý người dùng</span>
              </Link>

              {/* Button 4: Xem báo cáo chi tiết */}
              <Link
                href="/quan-tri/nhat-ky-he-thong"
                className="group flex h-12 w-full items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 text-xs font-semibold text-slate-700 transition-all hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <BarChart2 className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span>Xem báo cáo chi tiết</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Hoạt động gần đây (Recent Activities from Audit Logs or fallback) */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
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
              ) : (
                referenceActivities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.id} className="flex items-start gap-3 py-3">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${act.color}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 text-xs">
                        <p className="text-slate-700 dark:text-slate-200">
                          {act.actor ? (
                            <>
                              <strong className="font-bold text-slate-900 dark:text-white">{act.actor}</strong> {act.text}
                            </>
                          ) : (
                            act.text
                          )}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{act.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
