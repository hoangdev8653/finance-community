import React from 'react';
import Link from 'next/link';

interface TagBadgeProps {
  name: string;
  slug?: string;
  className?: string;
}

export function TagBadge({ name, slug, className = '' }: TagBadgeProps) {
  const targetSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <Link
      href={`/tags/${encodeURIComponent(targetSlug)}`}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-2xs font-mono font-medium text-muted-foreground bg-surface border border-border/80 hover:text-primary hover:border-primary/50 transition-colors ${className}`}
    >
      <span>#{name}</span>
    </Link>
  );
}
