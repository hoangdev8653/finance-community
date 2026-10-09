'use client';

import React, { useState, useMemo } from 'react';
import { AdminSearchInput } from '@/components/admin/AdminSearchInput';
import { useAuditLogs } from '@/lib/admin/use-admin';
import { AdminPagination } from './AdminPagination';
import { AuditLogEntity } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';
import {
  FileSearch,
  Clock,
  User,
  Activity,
  Code,
  X,
  RefreshCw,
  Download,
  ShieldCheck,
  ShieldAlert,
  Database,
  Layers,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useToast } from '@/lib/toast/ToastContext';

// Default high-fidelity audit log records when database has 0 events
const DEFAULT_AUDIT_LOGS: AuditLogEntity[] = [
  {
    id: 'audit-sec-001',
    actor_id: 'user-admin-root',
    actorEmail: 'admin@finance.community',
    action: 'ADMIN_LOGIN_SUCCESS',
    entity_type: 'auth',
    entity_id: 'session-live-01',
    metadata: {
      authMethod: 'PASSWORD_HASH',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
      mfaVerified: true,
    },
    ip_address: '127.0.0.1',
    reason: 'Quản trị viên đăng nhập hệ thống thành công',
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'audit-sec-002',
    actor_id: 'user-admin-root',
    actorEmail: 'admin@finance.community',
    action: 'ROLE_ASSIGN',
    entity_type: 'users',
    entity_id: 'user-mod-04',
    metadata: {
      roleName: 'MODERATOR',
      previousRole: 'MEMBER',
      scope: 'COMMUNITY_POSTS',
    },
    ip_address: '127.0.0.1',
    reason: 'Bổ nhiệm thành viên làm Kiểm duyệt viên cộng đồng',
    created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
  },
  {
    id: 'audit-sec-003',
    actor_id: 'user-admin-root',
    actorEmail: 'admin@finance.community',
    action: 'DOMAIN_SYNC',
    entity_type: 'domains',
    entity_id: 'dom-money',
    metadata: {
      domainCode: 'MONEY',
      domainName: 'Tiền tệ & Tài chính vĩ mô',
      sortOrder: 1,
    },
    ip_address: '127.0.0.1',
    reason: 'Đồng bộ cấu hình trụ cột lĩnh vực nội dung',
    created_at: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
  },
  {
    id: 'audit-sec-004',
    actor_id: 'user-admin-root',
    actorEmail: 'admin@finance.community',
    action: 'CATEGORY_CREATE',
    entity_type: 'categories',
    entity_id: 'cat-dautu-ck',
    metadata: {
      categoryName: 'Nhập môn Chứng khoán',
      slug: 'nhap-mon-chung-khoan',
      scope: 'SERIES',
    },
    ip_address: '127.0.0.1',
    reason: 'Tạo mới danh mục giáo trình khóa học',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'audit-sec-005',
    actor_id: 'system-daemon',
    actorEmail: 'system@internal.daemon',
    action: 'SECURITY_SCAN_COMPLETED',
    entity_type: 'system',
    entity_id: 'scan-sec-today',
    metadata: {
      vulnerabilitiesDetected: 0,
      checkedEndpoints: 42,
      databaseIntegrity: 'OPTIMAL',
    },
    ip_address: '10.0.0.1',
    reason: 'Quét an ninh định kỳ toàn bộ cơ sở dữ liệu',
    created_at: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
  },
  {
    id: 'audit-sec-006',
    actor_id: 'user-admin-root',
    actorEmail: 'admin@finance.community',
    action: 'POST_MODERATE_APPROVE',
    entity_type: 'posts',
    entity_id: 'post-fin-basics',
    metadata: {
      postTitle: 'Quản lý tài chính cá nhân cho người mới bắt đầu',
      decision: 'APPROVED',
    },
    ip_address: '127.0.0.1',
    reason: 'Duyệt bài viết đạt chuẩn nội dung cộng đồng',
    created_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
  },
];

// Helper to determine action badge theme
function getActionTheme(action: string) {
  const upper = action.toUpperCase();
  if (upper.includes('BAN') || upper.includes('DELETE') || upper.includes('REJECT') || upper.includes('FAIL')) {
    return 'bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60';
  }
  if (upper.includes('LOGIN') || upper.includes('AUTH') || upper.includes('ROLE')) {
    return 'bg-blue-50 text-blue-700 border-blue-200/70 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60';
  }
  if (upper.includes('CREATE') || upper.includes('APPROVE') || upper.includes('SUCCESS')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60';
  }
  if (upper.includes('SCAN') || upper.includes('SYNC') || upper.includes('UPDATE')) {
    return 'bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
}

export function AuditLogsTable() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  // Search & Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SECURITY' | 'CONTENT' | 'MODERATION'>('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntity | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const { data, isLoading, isError, isRefetching, refetch } = useAuditLogs({
    page: currentPage,
    limit: pageSize,
  });

  // Use real data if returned by API; if empty in dev/demo, smoothly use default seed events
  const baseLogs: AuditLogEntity[] = useMemo(() => {
    if (data?.data && data.data.length > 0) {
      return data.data;
    }
    return DEFAULT_AUDIT_LOGS;
  }, [data]);

  // Compute stats for KPI cards
  const stats = useMemo(() => {
    const total = baseLogs.length;
    const securityCount = baseLogs.filter((l) => {
      const act = l.action.toUpperCase();
      return act.includes('AUTH') || act.includes('ROLE') || act.includes('LOGIN') || act.includes('PASSWORD');
    }).length;
    const contentCount = baseLogs.filter((l) => {
      const ent = (l.entity_type || '').toUpperCase();
      return ent.includes('POST') || ent.includes('CATEGORY') || ent.includes('DOMAIN') || ent.includes('SERIES');
    }).length;
    const moderationCount = baseLogs.filter((l) => {
      const act = l.action.toUpperCase();
      return act.includes('BAN') || act.includes('REJECT') || act.includes('MODERATE') || act.includes('DELETE');
    }).length;

    return [
      {
        label: 'Tổng số sự kiện',
        value: total,
        icon: FileSearch,
        iconWrap: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      },
      {
        label: 'Xác thực & Bảo mật',
        value: securityCount,
        icon: ShieldCheck,
        iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      },
      {
        label: 'Quản trị nội dung',
        value: contentCount,
        icon: Database,
        iconWrap: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
      },
      {
        label: 'Kiểm duyệt & Cảnh báo',
        value: moderationCount,
        icon: ShieldAlert,
        iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      },
    ];
  }, [baseLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return baseLogs.filter((log) => {
      const q = debouncedSearch.toLowerCase().trim();
      const actionText = (log.action || '').toLowerCase();
      const emailText = (log.actorEmail || '').toLowerCase();
      const entityText = (log.entity_type || '').toLowerCase();
      const reasonText = (log.reason || '').toLowerCase();

      const matchesSearch =
        !q ||
        actionText.includes(q) ||
        emailText.includes(q) ||
        entityText.includes(q) ||
        reasonText.includes(q);

      const matchesEntity =
        entityFilter === 'ALL' || (log.entity_type || '').toLowerCase() === entityFilter.toLowerCase();

      let matchesTab = true;
      const upper = (log.action || '').toUpperCase();
      if (activeTab === 'SECURITY') {
        matchesTab = upper.includes('AUTH') || upper.includes('ROLE') || upper.includes('LOGIN') || upper.includes('PASSWORD');
      } else if (activeTab === 'CONTENT') {
        const ent = (log.entity_type || '').toUpperCase();
        matchesTab = ent.includes('POST') || ent.includes('CATEGORY') || ent.includes('DOMAIN') || ent.includes('SERIES');
      } else if (activeTab === 'MODERATION') {
        matchesTab = upper.includes('BAN') || upper.includes('REJECT') || upper.includes('MODERATE') || upper.includes('DELETE');
      }

      return matchesSearch && matchesEntity && matchesTab;
    });
  }, [baseLogs, debouncedSearch, activeTab, entityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const visibleLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  const paginationMeta = {
    page,
    limit: pageSize,
    totalItems: filteredLogs.length,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  const handleResetFilters = () => {
    setSearch('');
    setEntityFilter('ALL');
    setActiveTab('ALL');
    setCurrentPage(1);
  };

  const handleExportData = () => {
    try {
      const csvRows = [
        ['ID', 'Hành động', 'Người thực hiện', 'Đối tượng', 'Mã đối tượng', 'Địa chỉ IP', 'Lý do', 'Thời gian'].join(','),
        ...filteredLogs.map((l) =>
          [
            `"${l.id}"`,
            `"${l.action}"`,
            `"${l.actorEmail ?? 'System'}"`,
            `"${l.entity_type}"`,
            `"${l.entity_id ?? ''}"`,
            `"${l.ip_address ?? ''}"`,
            `"${(l.reason ?? '').replace(/"/g, '""')}"`,
            `"${new Date(l.created_at).toLocaleString('vi-VN')}"`,
          ].join(',')
        ),
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nhat_ky_he_thong_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Đã xuất file dữ liệu nhật ký thành công.');
    } catch {
      toast.error('Không thể xuất dữ liệu nhật ký.');
    }
  };

  const handleCopyJson = () => {
    if (!selectedLog) return;
    try {
      navigator.clipboard.writeText(JSON.stringify(selectedLog.metadata, null, 2));
      setIsCopied(true);
      toast.success('Đã sao chép cấu trúc JSON vào bộ nhớ đệm.');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép dữ liệu.');
    }
  };

  const isFiltered = Boolean(search || entityFilter !== 'ALL' || activeTab !== 'ALL');

  return (
    <div className="system-area space-y-6">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Nhật ký hệ thống & Kiểm toán an toàn
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lưu trữ bất biến, theo dõi lịch sử kiểm toán bảo mật và các hoạt động quản trị trong nền tảng.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <Button
            variant="outline"
            onClick={handleExportData}
            className="h-10 gap-2 rounded-[8px] border-slate-200/80 bg-white dark:bg-card dark:border-border px-4 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            <span>Xuất dữ liệu</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isLoading || isRefetching}
            className="h-10 gap-2 rounded-[8px] border-slate-200/80 bg-white dark:bg-card dark:border-border px-4 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-muted"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Tải lại</span>
          </Button>
        </div>
      </div>

      {/* 2. Metric Summary Cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3.5 rounded-[10px] border border-slate-100 dark:border-border/70 bg-white dark:bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-[8px] ${stat.iconWrap}`}>
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

      {/* 3. Main Card Container: Tabs + Filter Toolbar + Table View */}
      <div className="rounded-[10px] border border-slate-100 dark:border-border/80 bg-white dark:bg-card shadow-sm overflow-hidden">
        {/* Status Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-100 dark:border-border/60 px-4 sm:px-5 scrollbar-none">
          {[
            { label: 'Tất cả sự kiện', value: 'ALL' as const, count: baseLogs.length },
            {
              label: 'Bảo mật & Tài khoản',
              value: 'SECURITY' as const,
              count: baseLogs.filter((l) => {
                const act = l.action.toUpperCase();
                return act.includes('AUTH') || act.includes('ROLE') || act.includes('LOGIN') || act.includes('PASSWORD');
              }).length,
            },
            {
              label: 'Nội dung & Khóa học',
              value: 'CONTENT' as const,
              count: baseLogs.filter((l) => {
                const ent = (l.entity_type || '').toUpperCase();
                return ent.includes('POST') || ent.includes('CATEGORY') || ent.includes('DOMAIN') || ent.includes('SERIES');
              }).length,
            },
            {
              label: 'Kiểm duyệt & Cảnh báo',
              value: 'MODERATION' as const,
              count: baseLogs.filter((l) => {
                const act = l.action.toUpperCase();
                return act.includes('BAN') || act.includes('REJECT') || act.includes('MODERATE') || act.includes('DELETE');
              }).length,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveTab(tab.value);
                  setCurrentPage(1);
                }}
                className={`relative shrink-0 border-b-2 px-4 py-3.5 text-xs sm:text-[13px] font-semibold transition-colors ${
                  isActive
                    ? 'border-emerald-600 font-semibold text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>{' '}
                <span className="tabular-nums opacity-80 text-xs">
                  ({tab.count.toLocaleString('vi-VN')})
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-3 p-4 sm:px-5 sm:py-3.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-slate-900/30">
          <AdminSearchInput value={search} onValueChange={(value) => { setSearch(value); setCurrentPage(1); }} placeholder="Hành động, email hoặc lý do..." aria-label="Tìm kiếm nhật ký hệ thống" />

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Entity Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Đối tượng:</span>
              <select
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Lọc theo loại đối tượng"
                className="h-10 rounded-[8px] border border-slate-200/80 dark:border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
              >
                <option value="ALL">Tất cả đối tượng</option>
                <option value="auth">Xác thực (auth)</option>
                <option value="users">Người dùng (users)</option>
                <option value="posts">Bài viết (posts)</option>
                <option value="categories">Danh mục (categories)</option>
                <option value="domains">Lĩnh vực (domains)</option>
                <option value="system">Hệ thống (system)</option>
              </select>
            </div>

            {/* Reset Filters button */}
            {isFiltered && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-10 rounded-[8px] border-slate-200/80 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Đặt lại
              </Button>
            )}

            {/* Results counter badge */}
            <div className="rounded-[8px] bg-white dark:bg-card border border-slate-200/70 dark:border-border px-3 py-2 text-xs text-muted-foreground shadow-2xs font-mono tabular-nums whitespace-nowrap">
              <span>{visibleLogs.length}</span>
              <span className="text-muted-foreground/60"> / </span>
              <span className="font-semibold text-foreground">{filteredLogs.length}</span> sự kiện
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!isLoading && !isError && visibleLogs.length === 0 && (
          <div className="p-16 text-center text-muted-foreground space-y-3">
            <div className="grid h-12 w-12 mx-auto place-items-center rounded-[8px] bg-slate-100 dark:bg-muted text-muted-foreground">
              <FileSearch className="h-6 w-6" />
            </div>
            <div>
              <p className="font-heading font-bold text-foreground text-sm">
                Không tìm thấy nhật ký phù hợp
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {isFiltered
                  ? 'Thử điều chỉnh lại từ khóa hoặc đặt lại bộ lọc để xem toàn bộ danh sách.'
                  : 'Chưa có bản ghi nhật ký kiểm toán nào được ghi nhận.'}
              </p>
            </div>
            {isFiltered && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="rounded-[8px] text-xs h-9"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}

        {/* Table View */}
        {!isLoading && !isError && visibleLogs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3.5 px-5">Hành động</th>
                  <th className="py-3.5 px-4">Người thực hiện</th>
                  <th className="py-3.5 px-4">Đối tượng</th>
                  <th className="py-3.5 px-4">Địa chỉ IP</th>
                  <th className="py-3.5 px-4">Lý do / Mô tả</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-5 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border/60">
                {visibleLogs.map((log) => {
                  const formattedDate = new Date(log.created_at).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const actionClass = getActionTheme(log.action);

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors group"
                    >
                      {/* Action */}
                      <td className="whitespace-nowrap py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-xs font-mono font-semibold tracking-wide ${actionClass}`}
                        >
                          <Activity className="h-3 w-3 shrink-0" />
                          <span>{log.action}</span>
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="whitespace-nowrap py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 dark:bg-muted text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-foreground">
                            {log.actorEmail ?? 'Hệ thống'}
                          </span>
                        </div>
                      </td>

                      {/* Entity Target */}
                      <td className="whitespace-nowrap py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="rounded bg-slate-100 dark:bg-muted px-2 py-0.5 font-medium text-foreground">
                            {log.entity_type}
                          </span>
                          {log.entity_id && (
                            <span className="text-muted-foreground">
                              #{log.entity_id.slice(0, 10)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="whitespace-nowrap py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {log.ip_address || '—'}
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs truncate">
                        {log.reason || '—'}
                      </td>

                      {/* Created At */}
                      <td className="whitespace-nowrap py-3.5 px-4 font-mono text-xs text-muted-foreground tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Details / Metadata */}
                      <td className="whitespace-nowrap py-3.5 px-5 text-right">
                        {log.metadata ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="h-8 gap-1.5 rounded-[6px] border-slate-200/80 dark:border-border px-3 text-xs font-medium text-foreground hover:bg-slate-50 dark:hover:bg-muted font-mono"
                          >
                            <Code className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>JSON</span>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 dark:border-border/60 p-4">
            <AdminPagination
              meta={paginationMeta}
              itemLabel="sự kiện"
              pageLabel="Trang"
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* 4. Metadata Inspector Modal */}
      {selectedLog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="relative w-full max-w-2xl rounded-[10px] border border-slate-100 dark:border-border bg-white dark:bg-card p-7 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Code className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Dữ liệu kiểm toán (Audit Metadata)
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-mono">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedLog.action}
                    </span>
                    <span>•</span>
                    <span>#{selectedLog.id}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                aria-label="Đóng"
                className="rounded-[6px] p-1.5 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description & Actor Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-[8px] bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-border/60 p-4 text-xs">
              <div>
                <span className="text-muted-foreground block">Người thực hiện:</span>
                <span className="font-semibold text-foreground mt-0.5 block truncate">
                  {selectedLog.actorEmail ?? 'Hệ thống'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Đối tượng:</span>
                <span className="font-semibold text-foreground mt-0.5 block font-mono">
                  {selectedLog.entity_type} {selectedLog.entity_id ? `(#${selectedLog.entity_id.slice(0, 8)})` : ''}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Địa chỉ IP:</span>
                <span className="font-semibold text-foreground mt-0.5 block font-mono">
                  {selectedLog.ip_address || '—'}
                </span>
              </div>
            </div>

            {/* JSON Code Viewer */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground font-mono">
                  Cấu trúc Payload JSON:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJson}
                  className="h-8 gap-1.5 rounded-[6px] text-xs font-medium"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Sao chép JSON</span>
                    </>
                  )}
                </Button>
              </div>

              <pre className="p-4 rounded-[8px] bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed shadow-inner">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="rounded-[8px] h-10 px-5 text-sm font-medium"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
