'use client';

import React, { useState } from 'react';
import {
  useAdminFeatureFlags,
  useToggleFeatureFlag,
} from '@/lib/admin/use-admin';
import { FeatureFlagEntity } from '@/types/admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Flag, AlertCircle, RefreshCw } from 'lucide-react';

export function FeatureFlagsView() {
  const { data: flags, isLoading, isError, refetch } = useAdminFeatureFlags();
  const toggleMutation = useToggleFeatureFlag();

  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            Tính năng hệ thống
          </h2>
          <p className="text-xs text-muted-foreground font-mono">
            Toggle platform features and experimental capabilities in real time.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="text-xs font-mono gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Làm mới</span>
        </Button>
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

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-lg border border-border bg-surface/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="p-8 text-center rounded-lg border border-danger/20 bg-danger/5 space-y-3"
        >
          <p className="text-sm font-medium text-foreground">
            Failed to load feature flags.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && flags && flags.length === 0 && (
        <div className="p-12 text-center rounded-lg border border-dashed border-border bg-surface space-y-2">
          <Flag className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">Chưa cấu hình tính năng</h3>
          <p className="text-xs text-muted-foreground">
            No system feature flags are currently defined in the database.
          </p>
        </div>
      )}

      {!isLoading && !isError && flags && flags.length > 0 && (
        <div className="space-y-3">
          {flags.map((flag) => {
            const isPending = togglingKey === flag.key;

            return (
              <div
                key={flag.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/40"
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
                </div>

                <div className="flex items-center gap-3 shrink-0">
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
