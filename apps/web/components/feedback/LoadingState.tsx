'use client';

import React from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';
import { useTranslation } from '@/lib/i18n/useTranslation';

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export function LoadingState({ className, message = 'Loading content...', ...props }: LoadingStateProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn('flex flex-col items-center justify-center p-8 text-center min-h-[200px]', className)}
      {...props}
    >
      <Spinner size="lg" className="mb-3 text-primary" />
      <p className="text-xs font-medium text-muted-foreground">{message === 'Loading content...' ? t('common.loading') : message}</p>
    </div>
  );
}
