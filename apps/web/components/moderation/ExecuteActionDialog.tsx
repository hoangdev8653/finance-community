'use client';

import React, { useState } from 'react';
import { useExecuteModerationAction } from '@/lib/moderation/use-moderation';
import {
  ReportItem,
  ModerationActionType,
  ReportTargetType,
} from '@/types/moderation';
import { Button } from '@/components/ui/Button';
import {
  ShieldAlert,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ExecuteActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  report?: ReportItem | null;
  directTarget?: {
    type: ReportTargetType;
    id: string;
  } | null;
}

export function ExecuteActionDialog({
  isOpen,
  onClose,
  report,
  directTarget,
}: ExecuteActionDialogProps) {
  const targetType: ReportTargetType = report
    ? report.reportedPostId
      ? 'POST'
      : report.reportedCommentId
      ? 'COMMENT'
      : 'USER'
    : directTarget?.type || 'POST';

  const targetId: string = report
    ? report.reportedPostId ||
      report.reportedCommentId ||
      report.reportedUserId ||
      ''
    : directTarget?.id || '';

  const [actionType, setActionType] = useState<ModerationActionType>(
    targetType === 'USER' ? 'WARN' : 'HIDE_CONTENT'
  );
  const [reason, setReason] = useState<string>('');
  const [confirmedDestructive, setConfirmedDestructive] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const executeActionMutation = useExecuteModerationAction();

  if (!isOpen) return null;

  const isDestructive = actionType === 'SUSPEND' || actionType === 'BAN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    // Validation
    if (actionType === 'HIDE_CONTENT' && targetType === 'USER') {
      setClientError("Action 'HIDE_CONTENT' cannot be applied to a user target.");
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      setClientError('Enforcement reason must be at least 5 characters long.');
      return;
    }

    if (reason.trim().length > 500) {
      setClientError('Enforcement reason cannot exceed 500 characters.');
      return;
    }

    if (isDestructive && !confirmedDestructive) {
      setClientError('Vui lòng xác nhận ô kiểm tra hành động quan trọng trước khi tiếp tục.');
      return;
    }

    try {
      const payload = {
        reportId: report?.id || undefined,
        targetPostId: !report && targetType === 'POST' ? targetId : undefined,
        targetCommentId: !report && targetType === 'COMMENT' ? targetId : undefined,
        targetUserId: !report && targetType === 'USER' ? targetId : undefined,
        actionType,
        reason: reason.trim(),
      };

      await executeActionMutation.mutateAsync(payload);
      setSuccessInfo(`Moderation action '${actionType}' executed successfully.`);

      setTimeout(() => {
        onClose();
        setSuccessInfo(null);
        setReason('');
        setConfirmedDestructive(false);
      }, 1500);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Không thể thực hiện hành động kiểm duyệt.';
      setClientError(message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mod-action-title"
    >
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-warning/10 text-warning">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="mod-action-title" className="font-heading text-lg font-bold text-foreground">
                Execute Moderation Action
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Target: {targetType} #{targetId.slice(0, 8)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close action dialog"
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feedback Messages */}
        {clientError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-md bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-medium"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{clientError}</span>
          </div>
        )}

        {successInfo ? (
          <div
            role="status"
            className="flex items-center gap-2 rounded-md bg-success/10 border border-success/20 p-4 text-xs text-success font-medium"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{successInfo}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Action Type Selection */}
            <div className="space-y-1.5">
              <label htmlFor="action-type-select" className="text-xs font-semibold text-foreground">
                Action Type <span className="text-danger">*</span>
              </label>
              <select
                id="action-type-select"
                value={actionType}
                onChange={(e) => setActionType(e.target.value as ModerationActionType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
              >
                {targetType !== 'USER' && (
                  <option value="HIDE_CONTENT">HIDE_CONTENT (Conceal Post/Comment)</option>
                )}
                <option value="WARN">WARN (Issue Formal Policy Warning)</option>
                <option value="SUSPEND">SUSPEND (Suspend User Account)</option>
                <option value="BAN">BAN (Permanently Ban User)</option>
                {report && <option value="DISMISS">DISMISS (Dismiss Report as Non-Violating)</option>}
              </select>
            </div>

            {/* Reason Textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="action-reason" className="font-semibold text-foreground">
                  Enforcement Justification / Reason <span className="text-danger">*</span>
                </label>
                <span className="font-mono text-xs text-muted-foreground">
                  {reason.length} / 500 (min 5)
                </span>
              </div>
              <textarea
                id="action-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Detail the policy clause breached and audit justification..."
                className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary resize-y"
              />
            </div>

            {/* Destructive Warning & Confirmation Checkbox */}
            {isDestructive && (
              <div className="rounded-md border border-danger/30 bg-danger/5 p-3 space-y-2">
                <div className="flex items-start gap-2 text-danger text-xs font-medium">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Warning: This action immediately impairs user platform access and will be
                    synchronously logged to security audit logs.
                  </span>
                </div>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={confirmedDestructive}
                    onChange={(e) => setConfirmedDestructive(e.target.checked)}
                    className="rounded accent-danger"
                  />
                  <span>I confirm this penalty complies with platform governance standards.</span>
                </label>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={executeActionMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={isDestructive ? 'destructive' : 'primary'}
                size="sm"
                isLoading={executeActionMutation.isPending}
              >
                Execute Action
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
