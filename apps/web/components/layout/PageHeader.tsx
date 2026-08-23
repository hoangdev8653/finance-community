import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface PageHeaderProps {
  icon?: LucideIcon;
  label?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  icon: Icon,
  label,
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6',
        className
      )}
    >
      <div className="space-y-1.5 min-w-0">
        {Icon && label && (
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-medium">
            <Icon className="h-4 w-4" />
            <span className="uppercase tracking-widest">{label}</span>
          </div>
        )}
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
