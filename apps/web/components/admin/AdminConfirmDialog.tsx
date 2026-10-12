'use client';

import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminConfirmDialogProps {
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  isPending?: boolean;
  errorMessage?: string | null;
  additionalContent?: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AdminConfirmDialog({
  title,
  description,
  confirmLabel = 'Xóa',
  isPending = false,
  errorMessage,
  additionalContent,
  onCancel,
  onConfirm,
}: AdminConfirmDialogProps) {
  useEffect(() => {
    if (isPending) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPending, onCancel]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !isPending) onCancel(); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title" className="w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-6 text-foreground shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"><AlertTriangle className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1"><h2 id="admin-confirm-title" className="font-heading text-lg font-bold">{title}</h2><div className="mt-1 text-sm leading-6 text-muted-foreground">{description}</div></div>
          <button type="button" onClick={onCancel} disabled={isPending} aria-label="Đóng hộp thoại" className="-mr-2 -mt-2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"><X className="h-4 w-4" /></button>
        </div>
        {additionalContent}
        {errorMessage && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium leading-5 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">{errorMessage}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>Hủy</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>{isPending ? 'Đang xóa…' : confirmLabel}</Button>
        </div>
      </section>
    </div>
  );
}
