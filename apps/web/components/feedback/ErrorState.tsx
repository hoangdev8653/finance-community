import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { useTranslation } from '@/lib/i18n/useTranslation';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  className,
  title = 'Unable to load content',
  message = 'An unexpected network error occurred while retrieving data.',
  onRetry,
  ...props
}: ErrorStateProps) {
  const { t } = useTranslation();
  const displayTitle = title === 'Unable to load content' ? t('feedback.errorOccurred') : title;
  const displayMessage = message === 'An unexpected network error occurred while retrieving data.' ? t('feedback.errorOccurred') : message;
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-md,0.25rem)] border border-danger/30 bg-danger/5 min-h-[220px]',
        className
      )}
      {...props}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger mb-3">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-semibold text-foreground tracking-tight">{displayTitle}</h4>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">{displayMessage}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={onRetry}>
          <RotateCcw className="h-3.5 w-3.5" />
          {t('feedback.tryAgain')}
        </Button>
      )}
    </div>
  );
}
