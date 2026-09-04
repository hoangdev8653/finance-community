'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  description?: string;
  duration?: number;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  message?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'error';
  type?: ToastType;
  duration?: number;
}

export interface ToastFn {
  (options: ToastOptions | string): void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (type: ToastType, message: string, duration?: number, title?: string, description?: string) => void;
  removeToast: (id: string) => void;
  toast: ToastFn;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000, title?: string, description?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastMessage = { id, type, message, title, description, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastFn: ToastFn = useMemo(() => {
    const fn = (options: ToastOptions | string) => {
      if (typeof options === 'string') {
        addToast('info', options);
        return;
      }
      const variantType = options.variant === 'danger' ? 'error' : options.variant;
      const type: ToastType = options.type || (variantType as ToastType) || 'info';
      const message = options.message || options.title || options.description || '';
      addToast(type, message, options.duration ?? 4000, options.title, options.description);
    };

    fn.success = (msg: string, dur?: number) => addToast('success', msg, dur);
    fn.error = (msg: string, dur?: number) => addToast('error', msg, dur);
    fn.info = (msg: string, dur?: number) => addToast('info', msg, dur);
    fn.warning = (msg: string, dur?: number) => addToast('warning', msg, dur);

    return fn;
  }, [addToast]);

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      toast: toastFn,
    }),
    [toasts, addToast, removeToast, toastFn]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
