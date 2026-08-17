'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Compass, Grid, Hash, Home, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Divider } from '@/components/ui/Divider';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { label: 'Home Feed', href: '/', icon: Home },
  { label: 'Explore Posts', href: '/posts', icon: Compass },
  { label: 'Educational Series', href: '/series', icon: BookOpen },
  { label: 'Categories', href: '/categories', icon: Grid },
  { label: 'Market Tags', href: '/tags', icon: Hash },
];

const secondaryNavItems: NavItem[] = [
  { label: 'My Workspace', href: '/dashboard', icon: LayoutDashboard },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn('w-[260px] shrink-0 border-r border-border bg-background p-4 space-y-6', className)}>
      {/* Primary Navigation */}
      <div className="space-y-1">
        <h4 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Feeds & Discover
        </h4>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-md,0.25rem)] px-2.5 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <Divider />

      {/* Library / Saved */}
      <div className="space-y-1">
        <h4 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Personal Library
        </h4>
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-md,0.25rem)] px-2.5 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <Divider />

      {/* Footer Info */}
      <div className="px-2 text-[11px] text-muted-foreground space-y-1 leading-relaxed">
        <p className="font-medium text-foreground">Finance Community v1.0</p>
        <p>Built with Editorial Financial Precision & Strict Contract Architecture.</p>
      </div>
    </aside>
  );
}
