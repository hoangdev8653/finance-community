'use client';

import React, { useState } from 'react';
import {
  useAdminFeatureFlags,
  useToggleFeatureFlag,
} from '@/lib/admin/use-admin';
import { FeatureFlagEntity } from '@/types/admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Flag, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AdminSearchInput } from './AdminSearchInput';
import { useDebounce } from '@/lib/hooks/use-debounce';

export function FeatureFlagsView() {
  const { data: flags = [], isLoading, isError, refetch } = useAdminFeatureFlags();
  const toggleMutation = useToggleFeatureFlag();

  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 350);

  const handleToggle = async (flag: FeatureFlagEntity) => {
    setErrorMsg(null);
    setTogglingKey(flag.key);
    try {
      await toggleMutation.mutateAsync({
        key: flag.key,
        dto: { isEnabled: !flag.isEnabled, description: flag.description || undefined },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to toggle feature flag.';
      setErrorMsg(msg);
    } finally {
      setTogglingKey(null);
    }
  };

  const filteredFlags = (flags || []).filter((flag) => {
    const matchesStatus =
      selectedStatus === 'ALL'
        ? true
        : selectedStatus === 'ENABLED'
        ? flag.isEnabled
        : !flag.isEnabled;

    if (!matchesStatus) return false;

    if (!debouncedSearch.trim()) return true;
    const q = debouncedSearch.toLowerCase().trim();
    return (
      flag.key.toLowerCase().includes(q) ||
      (flag.description && flag.description.toLowerCase().includes(q))
    );
  });

  const enabledCount = flags.filter((f) => f.isEnabled).length;

  return (
    <div className="space-y-6">
      {/* Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Flag className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground">
              Tính năng hệ thống
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Bật tắt tính năng nền tảng và các khả năng thử nghiệm trong thời gian thực
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg self-start sm:self-auto text-xs font-mono">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'ENABLED', label: 'Đang bật' },
            { key: 'DISABLED', label: 'Đang tắt' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedStatus(tab.key as any)}
              className={`px-3 py-1.5 rounded-md transition-all font-semibold ${
                selectedStatus === tab.key
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminSearchInput
          value={search}
          onValueChange={setSearch}
          isLoading={isLoading}
          placeholder="Tìm cờ tính năng theo key hoặc mô tả..."
          aria-label="Tìm kiếm tính năng"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {filteredFlags.length} / {flags.length} tính năng
            </span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">
              {enabledCount} đang kích hoạt
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="h-8 text-xs self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span>Làm mới dữ liệu</span>
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 rounded-lg border border-danger/20 bg-danger/10 text-xs font-medium text-danger"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-border bg-surface/50 animate-pulse"
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
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <p className="text-sm font-medium text-foreground">
            Không thể tải danh sách tính năng hệ thống.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredFlags.length === 0 && (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-surface space-y-2">
          <Flag className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">
            {flags.length === 0 ? 'Chưa cấu hình tính năng' : 'Không tìm thấy tính năng phù hợp'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {flags.length === 0
              ? 'Chưa có cờ tính năng nào được định nghĩa trong cơ sở dữ liệu.'
              : `Không có tính năng nào khớp với từ khóa tìm kiếm “${search}”.`}
          </p>
        </div>
      )}

      {/* Flags List Container */}
      {!isLoading && !isError && filteredFlags.length > 0 && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xs divide-y divide-border">
          {filteredFlags.map((flag) => {
            const isPending = togglingKey === flag.key;

            return (
              <div
                key={flag.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {flag.key}
                    </span>
                    <Badge
                      variant={flag.isEnabled ? 'success' : 'secondary'}
                      className="text-3xs font-mono uppercase"
                    >
                      {flag.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  {flag.description && (
                    <p className="text-xs text-muted-foreground">{flag.description}</p>
                  )}
                  {flag.updatedAt && (
                    <p className="text-[11px] font-mono text-muted-foreground/70">
                      Cập nhật: {new Date(flag.updatedAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-muted-foreground">
                    {flag.isEnabled ? 'Đang bật' : 'Đang tắt'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={flag.isEnabled}
                    aria-label={`Toggle feature flag ${flag.key}`}
                    disabled={isPending}
                    onClick={() => handleToggle(flag)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      flag.isEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition-transform ${
                        flag.isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

