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
        return <CheckCircle2 className="h-4 w-4 text-success shrink-0" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-danger shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning shrink-0" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-primary shrink-0" />;
    }
  };

  const getToastBorder = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-success/30 bg-success/5 dark:bg-success/10';
      case 'error':
        return 'border-danger/30 bg-danger/5 dark:bg-danger/10';
      case 'warning':
        return 'border-warning/30 bg-warning/5 dark:bg-warning/10';
      case 'info':
      default:
        return 'border-primary/30 bg-primary/5 dark:bg-primary/10';
    }
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border ${getToastBorder(
            t.type
          )} bg-surface shadow-lg text-xs font-sans text-foreground backdrop-blur-xs animate-in slide-in-from-bottom-2 fade-in duration-200`}
        >
          <div className="flex items-center gap-2.5">
            {getToastIcon(t.type)}
            <p className="font-medium leading-relaxed">{t.message}</p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Đóng"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
