'use client';

import React, { useEffect, useState } from 'react';
import {
  List,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  Hash,
  Check,
  Link as LinkIcon,
  BookOpen,
} from 'lucide-react';
import type { ContentHeading } from './PostContentRenderer';

interface PostTableOfContentsProps {
  headings: ContentHeading[];
  isMobile?: boolean;
}

export function PostTableOfContents({ headings, isMobile = false }: PostTableOfContentsProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '');
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  // Scroll-Spy with IntersectionObserver
  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible headings
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by position from top
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-100px 0px -65% 0px',
        threshold: [0, 0.5, 1],
      },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  // Track Reading Progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = Math.min(100, Math.max(0, Math.round((window.scrollY / totalHeight) * 100)));
        setReadingProgress(currentProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!headings || headings.length === 0) return null;

  const handleHeadingClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
      setActiveId(id);
    }
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mobile Accordion View
  if (isMobile) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={!isCollapsed}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <List className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Mục lục bài viết</p>
              <p className="text-xs text-muted-foreground">{headings.length} phần nội dung chính</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <span>{isCollapsed ? 'Xem mục lục' : 'Thu gọn'}</span>
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </div>
        </button>

        {!isCollapsed && (
          <nav aria-label="Mục lục bài viết (di động)" className="mt-4 border-t border-border pt-3">
            <ol className="space-y-1">
              {headings.map((heading) => {
                const isActive = activeId === heading.id;
                return (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => handleHeadingClick(heading.id, e)}
                      className={`flex items-center gap-2 rounded-lg py-2 px-2.5 text-xs transition-colors ${
                        heading.level === 3 ? 'pl-6 text-foreground/80' : 'font-semibold text-foreground'
                      } ${
                        isActive
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                      <span className="line-clamp-1">{heading.text}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
      </div>
    );
  }

  // Desktop Sticky Sidebar View
  return (
    <nav
      aria-label="Mục lục bài viết"
      className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 sticky top-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
          <List className="h-4 w-4 text-primary" />
          <span>Mục lục bài viết</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
            {headings.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          title={isCollapsed ? 'Mở rộng mục lục' : 'Thu gọn mục lục'}
          aria-label="Thu gọn hoặc mở rộng"
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {/* Reading Progress Indicator */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>Tiến độ đọc</span>
          <span className="font-bold text-foreground">{readingProgress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-150"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </div>

      {/* Headings List */}
      {!isCollapsed && (
        <div className="max-h-[55vh] overflow-y-auto pr-1">
          <ol className="relative space-y-1 border-l border-border pl-2">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;
              const isCopied = copiedId === heading.id;

              return (
                <li key={heading.id} className="group relative">
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleHeadingClick(heading.id, e)}
                    aria-current={isActive ? 'location' : undefined}
                    className={`flex items-center justify-between rounded-lg py-1.5 px-2 text-xs leading-relaxed transition-all ${
                      heading.level === 3
                        ? 'pl-5 text-muted-foreground'
                        : 'font-semibold text-foreground/90'
                    } ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                        : 'hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <span className="line-clamp-2 pr-1">{heading.text}</span>

                    {/* Copy Link on Hover */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(heading.id, e)}
                      title="Sao chép link tới mục này"
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition p-1 text-muted-foreground hover:text-primary rounded-md"
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <LinkIcon className="h-3 w-3" />
                      )}
                    </button>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Footer / Scroll to Top */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition"
        >
          <ArrowUp className="h-3.5 w-3.5" />
          <span>Về đầu bài viết</span>
        </button>
      </div>
    </nav>
  );
}
