'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Compass, LayoutGrid, Tag, Home, Folder, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { TranslationKey } from '@/lib/i18n/useTranslation';

export interface NavItemConfig {
  labelKey: TranslationKey;
  href: string;
  icon: LucideIcon;
}

const mainNavConfig: NavItemConfig[] = [
  { labelKey: 'navigation.home', href: '/', icon: Home },
  { labelKey: 'navigation.explore', href: '/posts', icon: Compass },
  { labelKey: 'navigation.series', href: '/series', icon: BookOpen },
  { labelKey: 'navigation.categories', href: '/categories', icon: LayoutGrid },
  { labelKey: 'navigation.tags', href: '/tags', icon: Tag },
];

const secondaryNavConfig: NavItemConfig[] = [
  { labelKey: 'navigation.workspace', href: '/dashboard', icon: Folder },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside
      className={cn(
        'w-[230px] shrink-0 select-none flex flex-col justify-between',
        'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
        'h-[calc(100vh-4rem)] sticky top-16 overflow-hidden p-5',
        className
      )}
    >
      {/* Top Section: Navigation Links */}
      <div className="space-y-6">
        {/* Primary Navigation: Feeds & Discover */}
        <div className="space-y-2">
          <h4 className="px-2 text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t('navigation.feedsAndDiscover')}
          </h4>
          <nav className="space-y-1">
            {mainNavConfig.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0',
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400'
                    )}
                  />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Subtle Light Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* Library / Saved */}
        <div className="space-y-2">
          <h4 className="px-2 text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t('navigation.personalLibrary')}
          </h4>
          <nav className="space-y-1">
            {secondaryNavConfig.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0',
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400'
                    )}
                  />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Footer */}
      <div className="px-2 pb-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
        <p>Finance Community v1.0</p>
      </div>
    </aside>
  );
}
