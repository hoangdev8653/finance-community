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
          className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl border ${getToastClasses(
            t.type
          )} bg-surface/95 shadow-xl text-xs font-sans text-foreground backdrop-blur-md animate-in slide-in-from-right-4 fade-in duration-300`}
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="mt-0.5">{getToastIcon(t.type)}</div>
            <div className="space-y-1 min-w-0 flex-1">
              {t.title && (
                <h4 className="font-heading font-semibold text-foreground text-xs leading-snug">
                  {t.title}
                </h4>
              )}
              <p className="font-normal text-muted-foreground leading-relaxed break-words">
                {t.description || t.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
            aria-label="Đóng thông báo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </aside>
  );
}
