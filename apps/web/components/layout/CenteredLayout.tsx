import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CenteredLayoutProps {
  children: ReactNode;
  maxWidth?: string;
  className?: string;
}

export function CenteredLayout({
  children,
  maxWidth = 'max-w-md',
  className,
}: CenteredLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-surface/40 to-background',
        className
      )}
    >
      <div className={cn('w-full', maxWidth)}>
        {children}
      </div>
    </div>
  );
}
