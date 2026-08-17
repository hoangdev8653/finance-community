import React from 'react';
import Link from 'next/link';
import { Layers, BookOpen, ChevronRight, Folder } from 'lucide-react';
import { CategoryEntity } from '@/types/content';
import { Badge } from '@/components/ui/Badge';

interface CategoryCardProps {
  category: CategoryEntity;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const isSeries = category.scope === 'SERIES';
  const targetHref = isSeries ? `/series` : `/posts?categoryId=${encodeURIComponent(category.id)}`;

  return (
    <Link
      href={targetHref}
      className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-5 transition-all duration-150 hover:border-primary/40 hover:bg-surface-elevated hover:shadow-xs"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {isSeries ? <BookOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
          </div>
          <Badge
            variant={isSeries ? 'secondary' : 'outline'}
            className="font-mono text-[10px] uppercase tracking-wider py-0.5 px-2"
          >
            {category.scope}
          </Badge>
        </div>

        <div>
          <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {category.description || 'Institutional research and topical analyses.'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
        <span>{isSeries ? 'Browse Curriculum' : 'Explore Analyses'}</span>
        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
