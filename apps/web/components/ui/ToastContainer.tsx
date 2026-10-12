'use client';

import React from 'react';
import { useToast, ToastType } from '../../lib/toast/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-success shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-danger shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning shrink-0" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-primary shrink-0" />;
    }
  };

  const getToastClasses = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-success/30 bg-success/5 dark:bg-success/15';
      case 'error':
        return 'border-danger/30 bg-danger/5 dark:bg-danger/15';
      case 'warning':
        return 'border-warning/30 bg-warning/5 dark:bg-warning/15';
      case 'info':
      default:
        return 'border-primary/30 bg-primary/5 dark:bg-primary/15';
    }
  };

  return (
    <aside
      aria-live="polite"
      aria-atomic="true"
      className="fixed right-4 top-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-2 pointer-events-none sm:right-6 sm:top-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md animate-in slide-in-from-right-4 fade-in duration-300 sm:p-5 ${getToastClasses(
            t.type
          )} bg-surface text-base font-sans text-foreground`}
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="mt-0.5">{getToastIcon(t.type)}</div>
            <div className="min-w-0 flex-1 space-y-1">
              {t.title && (
                <h4 className="font-heading text-base font-bold leading-snug text-foreground sm:text-[17px]">
                  {t.title}
                </h4>
              )}
              <p className="break-words text-sm font-medium leading-6 text-slate-700 dark:text-slate-200 sm:text-[15px]">
                {t.description || t.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="shrink-0 rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-muted/60 hover:text-foreground dark:text-slate-300"
            aria-label="Đóng thông báo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </aside>
  );
}
