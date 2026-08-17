import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
}

export function Alert({ className, variant = 'info', title, children, ...props }: AlertProps) {
  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: XCircle,
  };

  const Icon = icons[variant];

  const variants = {
    info: 'border-blue-500/20 bg-blue-500/10 text-blue-900 dark:text-blue-200',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-200',
    danger: 'border-red-500/20 bg-red-500/10 text-red-900 dark:text-red-200',
  };

  return (
    <div
      role="alert"
      className={cn('flex items-start gap-3 rounded-[var(--radius-md,0.25rem)] border p-3 text-sm', variants[variant], className)}
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-xs leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
