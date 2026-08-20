'use client';

import React from 'react';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { useTranslation } from '@/lib/i18n/useTranslation';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
  imageSrc?: string;
}

export function EmptyState({
  className,
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FileText,
  imageSrc,
  ...props
}: EmptyStateProps) {
  const { t } = useTranslation();

  const displayTitle = title ?? t('feedback.noRecords');
  const displayDescription = description ?? t('feedback.noRecordsDesc');

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 min-h-[220px]',
        className
      )}
      {...props}
    >
      {imageSrc ? (
        <div className="relative h-28 w-28 mb-4">
          <Image
            src={imageSrc}
            alt={displayTitle}
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-3">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">{displayTitle}</h4>
      <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{displayDescription}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-4 font-semibold text-xs" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
