'use client';

import React, { useState } from 'react';
import { useFileReport } from '@/lib/moderation/use-moderation';
import { ReportTargetType, REPORT_REASONS } from '@/types/moderation';
import { Button } from '@/components/ui/Button';
import { Flag, X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
}

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0].label);
  const [description, setDescription] = useState<string>('');
  const [clientError, setClientError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const fileReportMutation = useFileReport();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    setSuccessInfo(null);

    if (!selectedReason) {
      setClientError('Please select a violation reason.');
      return;
    }

    if (description.length > 1000) {
      setClientError('Description cannot exceed 1000 characters.');
      return;
    }

    try {
      const payload = {
        reportedPostId: targetType === 'POST' ? targetId : undefined,
        reportedCommentId: targetType === 'COMMENT' ? targetId : undefined,
        reportedUserId: targetType === 'USER' ? targetId : undefined,
        reason: selectedReason,
        description: description.trim() || undefined,
      };

      const result = await fileReportMutation.mutateAsync(payload);

      if (result.isDuplicate) {
        setSuccessInfo('You have already filed an active report for this item. Our moderation team is reviewing it.');
      } else {
        setSuccessInfo('Report submitted successfully for moderator review. Thank you for keeping the community safe.');
      }

      setTimeout(() => {
        onClose();
        setSuccessInfo(null);
        setDescription('');
      }, 2000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Failed to submit report. Please try again.';
      setClientError(message);
    }
  };

  const targetLabel =
    targetType === 'POST' ? 'Post' : targetType === 'COMMENT' ? 'Comment' : 'User';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      aria-describedby="report-modal-desc"
    >
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-danger/10 text-danger">
              <Flag className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="report-modal-title" className="font-heading text-lg font-bold text-foreground">
                Report {targetLabel}
              </h2>
              {targetTitle && (
                <p id="report-modal-desc" className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-sm">
                  "{targetTitle}"
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
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
            className="flex items-start gap-2.5 rounded-md bg-success/10 border border-success/20 p-4 text-xs text-success font-medium"
          >
            {successInfo.includes('already') ? (
              <Info className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <span>{successInfo}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reason Selection */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold text-foreground">
                Why are you reporting this {targetLabel.toLowerCase()}? <span className="text-danger">*</span>
              </legend>
              <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.key}
                    className={`flex items-start gap-3 p-3 rounded-md border text-xs cursor-pointer transition-colors ${
                      selectedReason === r.label
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border hover:bg-surface text-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={r.label}
                      checked={selectedReason === r.label}
                      onChange={() => setSelectedReason(r.label)}
                      className="mt-0.5 accent-primary"
                    />
                    <div className="space-y-0.5">
                      <div className="font-medium text-foreground">{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Optional Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="report-description" className="font-medium text-foreground">
                  Additional Context (Optional)
                </label>
                <span className="font-mono text-xs text-muted-foreground">
                  {description.length} / 1000
                </span>
              </div>
              <textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Provide specific details or references to assist moderation review..."
                className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary resize-y"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={fileReportMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                isLoading={fileReportMutation.isPending}
              >
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
