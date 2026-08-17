'use client';

import React from 'react';
import { Heart } from 'lucide-react';

interface ReactionButtonProps {
  total: number;
  userReacted: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  size?: 'sm' | 'md';
  labelPrefix?: string;
  className?: string;
}

export function ReactionButton({
  total,
  userReacted,
  onToggle,
  isLoading = false,
  size = 'md',
  labelPrefix = 'Like this analysis',
  className = '',
}: ReactionButtonProps) {
  const isSm = size === 'sm';
  const countLabel = total === 1 ? '1 analyst liked this' : `${total} analysts liked this`;
  const accessibleLabel = `${userReacted ? 'Unlike' : 'Like'} - ${labelPrefix}. ${countLabel}`;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isLoading}
      aria-pressed={userReacted}
      aria-label={accessibleLabel}
      className={`inline-flex items-center justify-center font-mono font-medium transition-all duration-150 rounded-md focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary ${
        isSm
          ? 'gap-1 text-xs px-2 py-1'
          : 'gap-2 text-sm px-3.5 py-2 min-h-[44px]'
      } ${
        userReacted
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
          : 'bg-surface text-muted-foreground border border-border hover:text-foreground hover:bg-muted/60'
      } ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <Heart
        className={`${isSm ? 'h-3.5 w-3.5' : 'h-4 w-4'} transition-transform ${
          userReacted ? 'fill-current scale-110 text-rose-500' : 'stroke-current'
        }`}
        aria-hidden="true"
      />
      <span>{total}</span>
    </button>
  );
}
