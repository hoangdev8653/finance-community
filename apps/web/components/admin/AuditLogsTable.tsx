'use client';

import React, { useState } from 'react';
import { useAuditLogs } from '@/lib/admin/use-admin';
import { AdminPagination } from './AdminPagination';
import { AuditLogEntity } from '@/types/admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';
import {
  FileSearch,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Activity,
  Code,
  X,
  Filter,
} from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce';

export function AuditLogsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntityType, setFilterEntityType] = useState('');
  const [filterActorId, setFilterActorId] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntity | null>(null);

  const debouncedAction = useDebounce(filterAction, 350);
  const debouncedEntityType = useDebounce(filterEntityType, 350);
  const debouncedActorId = useDebounce(filterActorId, 350);

  const { data, isLoading, isError, refetch } = useAuditLogs({
    page: currentPage,
    limit: DEFAULT_PAGE_SIZE,
    action: debouncedAction.trim() || undefined,
    entityType: debouncedEntityType.trim() || undefined,
    actorId: debouncedActorId.trim() || undefined,
  });

  const logs = data?.data || [];
  const meta = data?.meta ?? { page: 1, limit: DEFAULT_PAGE_SIZE, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false };

  const handleResetFilters = () => {
    setFilterAction('');
    setFilterEntityType('');
    setFilterActorId('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileSearch className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground">
              Security & Governance Audit Logs
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {meta ? `${meta.totalItems} immutable security log events recorded` : 'Loading audit logs...'}
          </p>
        </div>
      </div>

      {/* Summary Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{meta ? meta.totalItems : 0} sự kiện</span>
          <span>•</span>
          <span>Lưu trữ bất biến (Immutable Audit Log)</span>
        </div>
        <div className="flex items-center gap-2">
          {(filterAction || filterEntityType || filterActorId) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs h-8 font-mono"
            >
              Reset Filters
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="text-xs h-8 font-mono"
          >
            Làm mới dữ liệu
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground font-mono">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>Audit Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="filter-action" className="text-xs font-mono text-muted-foreground">
              Action Name
            </label>
            <input
              id="filter-action"
              type="text"
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="e.g. ROLE_ASSIGN"
              className="mt-1 w-full rounded-lg border border-input bg-background p-2 text-xs font-mono text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="filter-entity-type" className="text-xs font-mono text-muted-foreground">
              Entity Type
            </label>
            <input
              id="filter-entity-type"
              type="text"
              value={filterEntityType}
              onChange={(e) => {
                setFilterEntityType(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="e.g. users, posts"
              className="mt-1 w-full rounded-lg border border-input bg-background p-2 text-xs font-mono text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="filter-actor-id" className="text-xs font-mono text-muted-foreground">
              Actor User UUID
            </label>
            <input
              id="filter-actor-id"
              type="text"
              value={filterActorId}
              onChange={(e) => {
                setFilterActorId(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Actor UUID..."
              className="mt-1 w-full rounded-lg border border-input bg-background p-2 text-xs font-mono text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl border border-border bg-surface/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="p-8 text-center rounded-xl border border-danger/20 bg-danger/5 space-y-3"
        >
          <p className="text-sm font-medium text-foreground">
            Failed to load audit logs.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && logs.length === 0 && (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-surface space-y-2">
          <FileSearch className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No Audit Logs Found</h3>
          <p className="text-xs text-muted-foreground">
            No matching audit records exist for the specified filters.
          </p>
        </div>
      )}

      {/* Desktop Table View */}
      {!isLoading && !isError && logs.length > 0 && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xs">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border font-mono text-muted-foreground uppercase text-3xs">
                <tr>
                  <th className="py-3 px-4">Hành động</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4">Đối tượng</th>
                  <th className="py-3 px-4">Lý do / Ghi chú</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {logs.map((log) => {
                  const formattedDate = new Date(log.created_at).toLocaleString(
                    'vi-VN',
                    { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                  );

                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-3 w-3 text-primary shrink-0" />
                          <span className="font-semibold text-foreground">{log.action}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {log.actorEmail ?? 'System'}
                      </td>

                      <td className="py-3 px-4 text-xs">
                        <span className="text-foreground">{log.entity_type}</span>
                        {log.entity_id && (
                          <span className="text-muted-foreground"> #{log.entity_id.slice(0, 8)}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground font-sans max-w-xs truncate">
                        {log.reason || '-'}
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {log.metadata ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="text-xs h-6 px-2 gap-1 font-mono"
                          >
                            <Code className="h-3 w-3" />
                            <span>JSON</span>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-3xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards */}
          <div className="md:hidden space-y-3">
            {logs.map((log) => {
              const formattedDate = new Date(log.created_at).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="rounded-lg border border-border bg-surface p-4 space-y-2.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">{log.action}</span>
                    <span className="text-xs text-muted-foreground">{formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div>Actor: {log.actorEmail ?? 'System'}</div>
                    <div>
                      Target: {log.entity_type} {log.entity_id ? `#${log.entity_id.slice(0, 8)}` : ''}
                    </div>
                  </div>

                  {log.reason && (
                    <p className="text-xs text-foreground/90 font-sans italic">
                      "{log.reason}"
                    </p>
                  )}

                  {log.metadata && (
                    <div className="pt-1 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="text-xs h-6 px-2"
                      >
                        Inspect Metadata
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <AdminPagination meta={meta} itemLabel="events" onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Metadata Inspector Modal */}
      {selectedLog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-meta-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 id="audit-meta-title" className="font-mono text-sm font-bold text-foreground">
                  Audit Event Metadata
                </h3>
                <p className="text-xs font-mono text-muted-foreground">
                  {selectedLog.action} (Event #{selectedLog.id.slice(0, 8)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                aria-label="Close dialog"
                className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <pre className="p-3 rounded-md bg-muted/30 border border-border text-xs font-mono text-foreground overflow-x-auto max-h-80">
              {JSON.stringify(selectedLog.metadata, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="font-mono text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
