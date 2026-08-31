'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ClipboardCheck,
  FileText,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useAdminOverview, useAuditLogs } from '@/lib/admin/use-admin';
import { adminService } from '@/lib/admin/admin-service';
import { AdminUserGrowthChart } from '@/components/admin/AdminUserGrowthChart';
import { AdminContentTrendChart } from '@/components/admin/AdminContentTrendChart';

const metrics = [
  ['Tổng danh mục', '—', 'Các danh mục đang hoạt động', '/admin/categories', FileText, 'text-violet-600'],
  ['Hàng chờ duyệt', '—', 'Bài viết đang chờ xử lý', '/admin/posts', ClipboardCheck, 'text-amber-700'],
  ['Báo cáo mở', '—', 'Nội dung cộng đồng cần xử lý', '/moderation', ShieldAlert, 'text-rose-600'],
  ['Người dùng hoạt động', '—', 'Tài khoản đang hoạt động', '/admin/users', Users, 'text-sky-600'],
  ['Tổng bài viết', '—', 'Tất cả bài viết trên hệ thống', '/posts', FileText, 'text-emerald-600'],
] as const;

export default function AdminOverviewPage() {
  const overviewQuery = useAdminOverview();
  const auditQuery = useAuditLogs({ page: 1, limit: 6 });
  const isLoading = overviewQuery.isLoading;

  const overviewData = overviewQuery.data;
  const openReports = overviewData?.openReports;
  const reviewQueue = overviewData?.reviewQueue;
  const activeUsers = overviewData?.activeUsers;
  const totalPosts = overviewData?.totalPosts;
  const activeCategories = overviewData?.activeCategories;
  const auditLogs = auditQuery.data?.data ?? [];
  const popularPosts: Array<any> = [];
  const categoryCounts: Array<any> = [];
  const categoryTotal = 0;
  const categoryNameVi: Record<string, string> = {
    'Personal Finance': 'Tài chính cá nhân', Stocks: 'Chứng khoán', Banking: 'Ngân hàng', 'Real Estate': 'Bất động sản', Macroeconomics: 'Vĩ mô',
    Business: 'Doanh nghiệp', Startups: 'Khởi nghiệp', 'Artificial Intelligence': 'Trí tuệ nhân tạo', Software: 'Phần mềm', Career: 'Nghề nghiệp', Skills: 'Kỹ năng', Health: 'Sức khỏe', Travel: 'Du lịch', Football: 'Bóng đá', Esports: 'Thể thao điện tử',
  };
  const categoryColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444', '#84cc16', '#ec4899', '#6366f1', '#f97316'];
  const domainColors: Record<string, string> = { MONEY: '#10b981', BUSINESS: '#3b82f6', TECH: '#8b5cf6', CAREER: '#f59e0b', LIFE: '#06b6d4', SPORTS: '#ef4444', GENERAL: '#94a3b8' };
  const categoryGradient = categoryCounts.length ? categoryCounts.slice(0, 10).reduce<{ stops: string[]; offset: number }>((result: { stops: string[]; offset: number }, category: { postCount: number; domainCode?: string }, index: number) => { const next = result.offset + (Number(category.postCount) / categoryTotal) * 100; const color = domainColors[category.domainCode || ''] || categoryColors[index % categoryColors.length]; result.stops.push(`${color} ${result.offset}% ${next}%`); result.offset = next; return result; }, { stops: [], offset: 0 }).stops.join(', ') : '#e2e8f0 0 100%';

  const formatDate = (value: string | null | undefined) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  const describeAuditAction = (action: string, entityType?: string) => {
    const labels: Record<string, string> = {
      POST_DELETE: 'Đã xóa bài viết', POST_CREATE: 'Đã tạo bài viết', POST_UPDATE: 'Đã cập nhật bài viết',
      MODERATION_APPROVE_POST: 'Đã duyệt bài viết', MODERATION_BAN_POST: 'Đã khóa bài viết',
      ROLE_REVOKE: 'Đã thu hồi quyền', ROLE_ASSIGN: 'Đã cấp quyền', USER_STATUS_UPDATE: 'Đã cập nhật trạng thái người dùng',
    };
    return labels[action] || `Đã thực hiện thao tác trên ${entityType || 'hệ thống'}`;
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Dashboard content */}
      <section aria-labelledby="overview-metrics">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="overview-metrics" className="text-base font-bold text-foreground">
            Tổng quan nhanh
          </h2>
          <span className="text-sm font-medium text-muted-foreground">Cập nhật theo thời gian thực</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map(([label, value, helper, href, Icon, accent]) => {
            const liveValue =
              label === 'Hàng chờ duyệt'
                ? reviewQueue
                : label === 'Báo cáo mở'
                ? openReports
                : label === 'Người dùng hoạt động'
                ? activeUsers
                : label === 'Tổng bài viết'
                ? totalPosts
                : label === 'Tổng danh mục'
                ? activeCategories
                : value;

            return (
              <Link
                key={label}
                href={href}
                className="group flex min-h-[76px] items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 shadow-card transition-colors hover:border-primary/40 hover:bg-surface/80 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="contents">
                  <span className={`order-1 shrink-0 rounded-lg bg-background p-2 ${accent}`}>
                    <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                </div>
                <div className="order-2 min-w-0 flex-1 text-xl font-extrabold tracking-tight text-foreground font-heading leading-none">
                  {isLoading ? '…' : liveValue}
                </div>
                <div className="order-3 truncate text-sm font-bold leading-tight text-foreground">{label}</div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <AdminUserGrowthChart series={overviewData?.userGrowthSeries} statusBreakdown={overviewData?.userStatusBreakdown} totalActiveUsers={activeUsers} isLoading={overviewQuery.isLoading} />
        <section className="rounded-xl border border-border bg-surface p-4 sm:p-5" aria-labelledby="recent-activity-heading">
          <div className="mb-3 flex items-center justify-between"><div><h2 id="recent-activity-heading" className="text-lg font-extrabold text-foreground">Hoạt động gần đây</h2><p className="mt-1 text-sm font-medium text-muted-foreground">Các sự kiện mới nhất trong hệ thống.</p></div><Link href="/admin/audit-logs" className="text-sm font-bold text-primary hover:underline">Xem tất cả</Link></div>
          <div className="divide-y divide-border">{auditQuery.isLoading ? <p className="py-8 text-center text-sm text-muted-foreground">Đang tải hoạt động...</p> : auditLogs.slice(0, 5).map((log) => <div key={log.id} className="flex gap-3 py-3"><span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-primary" /><div className="min-w-0"><p className="line-clamp-2 text-base font-semibold text-foreground">{describeAuditAction(log.action, log.entityType ?? log.entity_type)}</p><p className="mt-1 text-sm font-medium text-muted-foreground">{log.actorEmail ?? 'Hệ thống'} · {formatDate(log.createdAt ?? log.created_at)}</p></div></div>)}{!auditQuery.isLoading && auditLogs.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Chưa có hoạt động.</p>}</div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <AdminContentTrendChart
          series={overviewData?.postGrowthSeries}
          postStatusBreakdown={overviewData?.postStatusBreakdown}
          totalPosts={totalPosts}
          isLoading={overviewQuery.isLoading}
        />
      </div>

      {false && <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]">
        <section className="rounded-xl border border-border bg-surface p-5" aria-labelledby="popular-posts-heading">
          <div className="mb-4 flex items-center justify-between"><h2 id="popular-posts-heading" className="text-lg font-extrabold text-foreground">Bài viết phổ biến</h2><Link href="/posts" className="text-sm font-bold text-primary hover:underline">Xem tất cả</Link></div>
          {popularPosts.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="border-b border-border text-muted-foreground"><tr><th className="px-2 py-2">#</th><th className="px-2 py-2">Tiêu đề</th><th className="px-2 py-2">Tác giả</th><th className="px-2 py-2">Domain</th><th className="px-2 py-2">Category</th><th className="px-2 py-2 text-right">Lượt xem</th><th className="px-2 py-2 text-right">Bình luận</th></tr></thead><tbody className="divide-y divide-border">{popularPosts.map((post: any, index: number) => <tr key={post.id} className="hover:bg-muted/40"><td className="px-2 py-3 font-bold text-muted-foreground">{index + 1}</td><td className="max-w-[240px] px-2 py-3"><Link href={`/posts/${post.contentType.toLowerCase()}/${post.slug}`} className="font-semibold text-foreground hover:text-primary">{post.title}</Link></td><td className="px-2 py-3 text-foreground">{post.authorName || post.authorUsername || 'Chưa xác định'}</td><td className="px-2 py-3"><span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: domainColors[post.domainCode] || '#64748b' }}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: domainColors[post.domainCode] || '#94a3b8' }} />{post.domainNameVi || post.domainName || 'Khác'}</span></td><td className="px-2 py-3 text-foreground">{post.categoryNameVi || post.categoryName || 'Khác'}</td><td className="px-2 py-3 text-right text-muted-foreground">{Number(post.viewCount).toLocaleString('vi-VN')}</td><td className="px-2 py-3 text-right text-muted-foreground">{Number(post.commentCount || 0)}</td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu bài viết phổ biến.</p>}
        </section>
        <section className="rounded-xl border border-border bg-surface p-5" aria-labelledby="category-stats-heading">
          <div className="mb-4 flex items-center justify-between"><h2 id="category-stats-heading" className="text-lg font-extrabold text-foreground">Thống kê theo domain</h2><Link href="/admin/categories" className="text-sm font-bold text-primary hover:underline">Quản lý</Link></div>
          {categoryCounts.length ? <div className="flex items-start gap-6"><div className="h-32 w-32 shrink-0 rounded-full" style={{ background: `conic-gradient(${categoryGradient})` }}><div className="m-7 flex h-16 w-16 items-center justify-center rounded-full bg-surface text-sm font-bold text-foreground">{categoryTotal}</div></div><div className="grid max-h-40 flex-1 grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto pr-1">{categoryCounts.slice(0, 10).map((category: any, index: number) => <div key={category.categoryId ?? index} className="flex min-w-0 items-center gap-2 text-sm"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: domainColors[category.domainCode] || categoryColors[index % categoryColors.length] }} /><span className="truncate text-foreground">{categoryNameVi[category.categoryName] || category.categoryName || 'Chưa phân loại'}</span><span className="text-xs font-semibold text-muted-foreground">{category.postCount}</span></div>)}</div></div> : <p className="py-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu danh mục.</p>}
        </section>
      </div>}

      {false && <section
        aria-labelledby="recent-activity"
        className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 id="recent-activity" className="text-base font-semibold text-foreground">
              Recent activity
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Latest governance events recorded by the API.
            </p>
          </div>
          <Link href="/admin/audit-logs" className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="pb-3 pr-4 font-medium">Time</th>
                <th className="pb-3 pr-4 font-medium">Actor</th>
                <th className="pb-3 pr-4 font-medium">Action</th>
                <th className="pb-3 pr-4 font-medium">Entity</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Loading recent activity...
                  </td>
                </tr>
              ) : auditQuery.isError ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-rose-400">
                    Unable to load audit activity.
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No audit activity recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => {
                  const time = log.createdAt ?? log.created_at;
                  const action = log.action ?? '';
                  const entityType = log.entityType ?? log.entity_type;
                  const entityId = log.entityId ?? log.entity_id;

                  return (
                    <tr key={log.id} className="group">
                      <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">
                        {formatDate(time)}
                      </td>
                      <td className="py-3 pr-4 text-foreground">
                        {log.actorEmail ?? log.actorId ?? 'System'}
                      </td>
                      <td className="py-3 pr-4 font-medium text-foreground">{action}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {entityType}
                        {entityId ? ` · ${entityId.slice(0, 8)}` : ''}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-2 text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Recorded
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>}
    </div>
  );
}

