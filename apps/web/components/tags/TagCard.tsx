import React from 'react';
import Link from 'next/link';
import { Hash } from 'lucide-react';
import { TagEntity } from '@/types/content';
import { Badge } from '@/components/ui/Badge';

interface TagCardProps {
  tag: TagEntity;
}

export function TagCard({ tag }: TagCardProps) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag.slug)}`}
      className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3.5 transition-all duration-150 hover:border-primary/40 hover:bg-surface-elevated hover:shadow-xs"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <Hash className="h-3.5 w-3.5" />
        </div>
        <span className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {tag.name}
        </span>
      </div>
      <Badge variant="outline" className="shrink-0 font-mono text-[10px] text-muted-foreground py-0.5 px-2">
        {tag.usageCount.toLocaleString()} {tag.usageCount === 1 ? 'analysis' : 'analyses'}
      </Badge>
    </Link>
  );
}
