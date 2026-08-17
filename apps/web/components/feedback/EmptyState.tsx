import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export function EmptyState({
  className,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  icon: Icon = FileText,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-md,0.25rem)] border border-dashed border-border bg-surface/50 min-h-[220px]',
        className
      )}
      {...props}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
