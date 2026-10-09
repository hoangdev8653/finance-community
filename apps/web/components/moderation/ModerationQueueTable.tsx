'use client';

import React, { useState } from 'react';
import { useModerationQueue } from '@/lib/moderation/use-moderation';
import { ReportItem, ReportStatus } from '@/types/moderation';
import { ExecuteActionDialog } from './ExecuteActionDialog';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminSearchInput } from '@/components/admin/AdminSearchInput';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  User,
  RefreshCw,
} from 'lucide-react';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';

export function ModerationQueueTable() {
  const [selectedStatus, setSelectedStatus] = useState<string>('OPEN');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 350);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const statusParam = selectedStatus === 'ALL' ? undefined : selectedStatus;
  const { data, isLoading, isError, refetch } = useModerationQueue({
    status: statusParam,
    page: currentPage,
    limit: DEFAULT_PAGE_SIZE,
  });

  const reports = data?.data || [];
  const meta = data?.meta ?? {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const filteredReports = reports.filter((report) => {
    if (!debouncedSearch.trim()) return true;
    const q = debouncedSearch.toLowerCase().trim();
    return (
      (report.reason && report.reason.toLowerCase().includes(q)) ||
      (report.description && report.description.toLowerCase().includes(q)) ||
      (report.reporterId && report.reporterId.toLowerCase().includes(q)) ||
      (report.reportedPostId && report.reportedPostId.toLowerCase().includes(q)) ||
      (report.reportedCommentId && report.reportedCommentId.toLowerCase().includes(q)) ||
      (report.reportedUserId && report.reportedUserId.toLowerCase().includes(q))
    );
  });

  const handleStatusTab = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const getStatusBadgeVariant = (status: ReportStatus) => {
    switch (status) {
      case 'OPEN':
        return 'danger';
      case 'REVIEWING':
        return 'warning';
      case 'RESOLVED':
        return 'success';
      case 'DISMISSED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: ReportStatus) =>
    ({
      OPEN: 'Chờ xử lý',
      REVIEWING: 'Đang xem xét',
      RESOLVED: 'Đã xử lý',
      DISMISSED: 'Đã bỏ qua',
    })[status] ?? status;

  const getTargetIcon = (report: ReportItem) => {
    if (report.reportedPostId) {
      return <FileText className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />;
    }
    if (report.reportedCommentId) {
      return <MessageSquare className="h-3.5 w-3.5 text-secondary shrink-0" aria-hidden="true" />;
    }
    return <User className="h-3.5 w-3.5 text-warning shrink-0" aria-hidden="true" />;
  };

  const getTargetInfo = (report: ReportItem) => {
    if (report.reportedPostId) {
      return { type: 'POST', id: report.reportedPostId };
    }
    if (report.reportedCommentId) {
      return { type: 'COMMENT', id: report.reportedCommentId };
    }
    return { type: 'USER', id: report.reportedUserId || 'unknown' };
  };

  return (
    <div className="space-y-5">
      {/* Header & Status Filter Tabs */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="font-heading text-lg font-bold tracking-tight text-slate-900">
              Hàng đợi Báo cáo Vi phạm
            </h1>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Xem xét và xử lý các báo cáo vi phạm nội dung hoặc hành vi từ cộng đồng
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1 self-start sm:self-auto text-sm">
          {[
            { key: 'OPEN', label: 'Chờ xử lý' },
            { key: 'REVIEWING', label: 'Đang xem xét' },
            { key: 'RESOLVED', label: 'Đã xử lý' },
            { key: 'DISMISSED', label: 'Đã bỏ qua' },
            { key: 'ALL', label: 'Tất cả' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleStatusTab(tab.key)}
              className={`shrink-0 rounded-lg px-3 py-2 transition-all font-semibold ${
                selectedStatus === tab.key
                  ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <AdminSearchInput
          value={search}
          onValueChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          isLoading={isLoading}
          placeholder="Tìm theo lý do, mô tả, người báo cáo hoặc ID đối tượng..."
          aria-label="Tìm kiếm báo cáo vi phạm"
        />
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">
              {filteredReports.length} / {meta.totalItems} báo cáo
            </span>
            <span>•</span>
            <span>
              {selectedStatus === 'ALL'
                ? 'Tất cả trạng thái'
                : selectedStatus === 'OPEN'
                ? 'Đang chờ xử lý'
                : selectedStatus === 'REVIEWING'
                ? 'Đang xem xét'
                : selectedStatus === 'RESOLVED'
                ? 'Đã xử lý'
                : 'Đã bỏ qua'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="h-9 rounded-lg px-3 text-sm self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span>Làm mới dữ liệu</span>
          </Button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 rounded-[10px] border border-border bg-surface/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="flex flex-col items-center justify-center p-8 rounded-[10px] border border-danger/20 bg-danger/5 text-center space-y-3"
        >
          <AlertCircle className="h-8 w-8 text-danger" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            Không thể tải hàng đợi báo cáo.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredReports.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 rounded-[10px] border border-dashed border-border bg-surface text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-success/70" aria-hidden="true" />
          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-foreground">
              {reports.length === 0 ? 'Hàng đợi đang trống' : 'Không tìm thấy báo cáo phù hợp'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {reports.length === 0
                ? `Không có báo cáo nào phù hợp với bộ lọc “${selectedStatus}”.`
                : `Không có báo cáo nào khớp với từ khóa “${search}”.`}
            </p>
          </div>
        </div>
      )}

      {/* Table Container */}
      {!isLoading && !isError && filteredReports.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm font-sans">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="py-3 px-4">Đối tượng</th>
                  <th className="py-3 px-4">Lý do / Mô tả</th>
                  <th className="py-3 px-4">Người báo cáo</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => {
                  const target = getTargetInfo(report);
                  const formattedDate = new Date(report.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={report.id} className="group transition-colors hover:bg-emerald-50/40">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          {getTargetIcon(report)}
                          <span className="font-semibold text-slate-900">{target.type}</span>
                          <span className="text-slate-500 text-sm">
                            #{target.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground">{report.reason}</div>
                          {report.description && (
                            <div className="text-sm text-slate-600 truncate">
                              "{report.description}"
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-500 text-sm">
                        {report.reporterId ? `#${report.reporterId.slice(0, 8)}` : 'Ẩn danh'}
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant={getStatusBadgeVariant(report.status)} className="text-xs">
                          {getStatusLabel(report.status)}
                        </Badge>
                      </td>

                      <td className="py-4 px-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                          className="text-sm h-9 rounded-lg px-3"
                        >
                          Xem xét
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (<768px) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredReports.map((report) => {
              const target = getTargetInfo(report);
              const formattedDate = new Date(report.createdAt).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={report.id} className="p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      {getTargetIcon(report)}
                      <span>{target.type}</span>
                      <span className="text-slate-500 text-sm font-normal">
                        #{target.id.slice(0, 8)}
                      </span>
                    </div>

                    <Badge variant={getStatusBadgeVariant(report.status)} className="text-xs">
                      {getStatusLabel(report.status)}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">{report.reason}</p>
                    {report.description && (
                      <p className="text-sm text-slate-600 italic">"{report.description}"</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-sm text-slate-600">
                    <span>{formattedDate}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                      className="text-sm h-9 rounded-lg px-3"
                    >
                      Xem xét
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Bar */}
          <AdminPagination meta={meta} itemLabel="báo cáo" onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Action Execution Dialog */}
      {selectedReport && (
        <ExecuteActionDialog
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          report={selectedReport}
        />
      )}
    </div>
  );
}

