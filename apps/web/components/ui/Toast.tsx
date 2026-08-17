'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
}

export interface ToastContextType {
  toast: (options: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = (options: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...options, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start justify-between gap-3 rounded-[var(--radius-md,0.25rem)] border border-border bg-surface-elevated p-3 text-foreground shadow-lg animate-in slide-in-from-bottom-5',
              t.variant === 'danger' && 'border-danger/30 bg-danger/10',
              t.variant === 'success' && 'border-success/30 bg-success/10'
            )}
          >
            <div className="space-y-1">
              <h6 className="text-xs font-semibold">{t.title}</h6>
              {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground p-0.5"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
