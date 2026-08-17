'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils/cn';

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={200}>{children}</TooltipPrimitive.Provider>;
}

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          side={side}
          className={cn(
            'z-50 overflow-hidden rounded-[var(--radius-sm,0.125rem)] bg-secondary px-3 py-1.5 text-xs text-secondary-foreground shadow-sm animate-in fade-in-0 zoom-in-95'
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-secondary" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  );
}
