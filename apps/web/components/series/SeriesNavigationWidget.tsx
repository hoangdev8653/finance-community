'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { postsService } from '../../lib/posts/posts-service';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  CheckCircle2,
} from 'lucide-react';

interface SeriesNavData {
  series: { id: string; name: string; slug: string };
  currentPostIndex: number;
  totalPosts: number;
  previousPost: { id: string; title: string; slug: string } | null;
  nextPost: { id: string; title: string; slug: string } | null;
  tableOfContents: Array<{
    index: number;
    id: string;
    title: string;
    slug: string;
    isCurrent: boolean;
  }>;
}

interface SeriesNavigationWidgetProps {
  postId: string;
}

export function SeriesNavigationWidget({ postId }: SeriesNavigationWidgetProps) {
  const [navData, setNavData] = useState<SeriesNavData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    postsService
      .getSeriesNavigation(postId)
      .then((data) => {
        if (isMounted) setNavData(data);
      })
      .catch(() => {
        // Fallback gracefully
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  if (isLoading || !navData) return null;

  return (
    <div className="space-y-6 pt-6 border-t border-border">
      {/* Prev / Next Navigation Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {navData.previousPost ? (
          <Link
            href={`/posts/series/${navData.previousPost.slug}`}
            className="group rounded-xl border border-border bg-surface p-4 space-y-1 hover:border-primary/50 transition-all shadow-2xs flex flex-col justify-between"
          >
            <span className="inline-flex items-center gap-1 text-2xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Bài trước đó</span>
            </span>
            <p className="text-sm font-serif font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {navData.previousPost.title}
            </p>
          </Link>
        ) : (
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4 flex items-center text-xs text-muted-foreground font-mono">
            <span>Đây là bài đầu tiên trong series</span>
          </div>
        )}

        {navData.nextPost ? (
          <Link
            href={`/posts/series/${navData.nextPost.slug}`}
            className="group rounded-xl border border-border bg-surface p-4 space-y-1 hover:border-primary/50 transition-all shadow-2xs flex flex-col justify-between sm:text-right"
          >
            <span className="inline-flex items-center justify-end gap-1 text-2xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
              <span>Bài tiếp theo</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm font-serif font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {navData.nextPost.title}
            </p>
          </Link>
        ) : (
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4 flex items-center justify-center text-xs text-muted-foreground font-mono">
            <span>Đã hoàn thành toàn bộ series</span>
          </div>
        )}
      </div>

      {/* Table of Contents Box */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-primary font-serif font-bold text-base">
            <BookOpen className="h-5 w-5" />
            <span>Mục lục Chuỗi bài học: {navData.series.name}</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Phần {navData.currentPostIndex} / {navData.totalPosts}
          </span>
        </div>

        <div className="space-y-1.5 max-h-72 overflow-y-auto font-sans text-xs">
          {navData.tableOfContents.map((item) => (
            <Link
              key={item.id}
              href={`/posts/series/${item.slug}`}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                item.isCurrent
                  ? 'bg-primary/10 text-primary font-bold border border-primary/30 shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="font-mono text-2xs w-5 shrink-0 opacity-75">
                  #{item.index}
                </span>
                <span className="truncate">{item.title}</span>
              </div>
              {item.isCurrent && (
                <span className="shrink-0 flex items-center gap-1 text-2xs font-mono text-primary font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Đang đọc</span>
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
