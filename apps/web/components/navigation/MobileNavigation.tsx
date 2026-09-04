'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Compass, Grid, Home, User, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslation, TranslationKey } from '@/lib/i18n/useTranslation';

interface MobileNavItemConfig {
  labelKey: TranslationKey;
  href: string;
  icon: LucideIcon;
}

const mobileNavConfig: MobileNavItemConfig[] = [
  { labelKey: 'navigation.home', href: '/', icon: Home },
  { labelKey: 'navigation.explore', href: '/posts', icon: Compass },
  { labelKey: 'navigation.series', href: '/series', icon: BookOpen },
  { labelKey: 'navigation.categories', href: '/categories', icon: Grid },
  { labelKey: 'navigation.account', href: '/login', icon: User },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-16 w-full max-w-md mx-auto items-center px-1">
        {mobileNavConfig.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const label = item.href === '/series' ? 'Series' : t(item.labelKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 w-full min-h-[44px] rounded-xl transition-all duration-150 select-none',
                isActive
                  ? 'text-teal-700 dark:text-teal-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.25]')} />
              <span className="text-[10px] sm:text-[11px] font-medium tracking-tight truncate max-w-full text-center">
                {label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 h-1 w-5 rounded-full bg-teal-600 dark:bg-teal-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
