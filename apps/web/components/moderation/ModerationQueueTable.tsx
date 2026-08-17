'use client';

import React, { useState } from 'react';
import { useModerationQueue } from '@/lib/moderation/use-moderation';
import { ReportItem, ReportStatus } from '@/types/moderation';
import { ExecuteActionDialog } from './ExecuteActionDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  User,
} from 'lucide-react';

export function ModerationQueueTable() {
  const [selectedStatus, setSelectedStatus] = useState<string>('OPEN');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const statusParam = selectedStatus === 'ALL' ? undefined : selectedStatus;
  const { data, isLoading, isError, refetch } = useModerationQueue({
    status: statusParam,
    page: currentPage,
    limit: 10,
  });

  const reports = data?.data || [];
  const meta = data?.meta;

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
    <div className="space-y-6">
      {/* Header & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" aria-hidden="true" />
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">
              Moderation Queue
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {meta ? `${meta.totalItems} total reports logged` : 'Loading queue...'}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg flex-wrap">
          {['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED', 'ALL'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusTab(status)}
              className={`px-3 py-1.5 text-2xs font-mono rounded-md transition-colors ${
                selectedStatus === status
                  ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg border border-border bg-surface/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="flex flex-col items-center justify-center p-8 rounded-lg border border-danger/20 bg-danger/5 text-center space-y-3"
        >
          <AlertCircle className="h-8 w-8 text-danger" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            Failed to load moderation queue.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 rounded-lg border border-dashed border-border bg-surface text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-success/70" aria-hidden="true" />
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-foreground">
              Queue is Clear
            </h3>
            <p className="text-xs text-muted-foreground">
              No reports found matching status filter "{selectedStatus}".
            </p>
          </div>
        </div>
      )}

      {/* Desktop Data Table */}
      {!isLoading && !isError && reports.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border font-mono text-muted-foreground uppercase text-3xs">
                <tr>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Reason / Description</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reported At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((report) => {
                  const target = getTargetInfo(report);
                  const formattedDate = new Date(report.createdAt).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                  );

                  return (
                    <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          {getTargetIcon(report)}
                          <span className="font-semibold text-foreground">{target.type}</span>
                          <span className="text-muted-foreground text-2xs">
                            #{target.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground">{report.reason}</div>
                          {report.description && (
                            <div className="text-2xs text-muted-foreground truncate">
                              "{report.description}"
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted-foreground text-2xs">
                        {report.reporterId ? `#${report.reporterId.slice(0, 8)}` : 'Anonymous'}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={getStatusBadgeVariant(report.status)} className="text-3xs font-mono">
                          {report.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-2xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                          className="text-xs h-7 px-2.5 font-mono"
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards (<768px) */}
          <div className="md:hidden space-y-3">
            {reports.map((report) => {
              const target = getTargetInfo(report);
              const formattedDate = new Date(report.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={report.id}
                  className="rounded-lg border border-border bg-surface p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
                      {getTargetIcon(report)}
                      <span>{target.type}</span>
                      <span className="text-muted-foreground text-2xs font-normal">
                        #{target.id.slice(0, 8)}
                      </span>
                    </div>

                    <Badge variant={getStatusBadgeVariant(report.status)} className="text-3xs font-mono">
                      {report.status}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">{report.reason}</p>
                    {report.description && (
                      <p className="text-2xs text-muted-foreground italic">"{report.description}"</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60 text-2xs text-muted-foreground font-mono">
                    <span>{formattedDate}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                      className="text-xs h-7 px-3"
                    >
                      Review Action
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Bar */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-border text-xs font-mono text-muted-foreground">
              <div>
                Page {meta.page} of {meta.totalPages} ({meta.totalItems} items)
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPreviousPage}
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!meta.hasNextPage}
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
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
