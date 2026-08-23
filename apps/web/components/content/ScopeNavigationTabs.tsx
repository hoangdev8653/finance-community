'use client';

import React from 'react';
import { Sparkles, Globe, Building2, BookOpen, MessageSquareText } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { cn } from '@/lib/utils/cn';

export type ScopeFilter = 'ALL' | 'DOMESTIC' | 'GLOBAL' | 'SERIES' | 'COMMODITIES';

interface ScopeNavigationTabsProps {
  currentScope: ScopeFilter;
  onSelectScope: (scope: ScopeFilter) => void;
}

export function ScopeNavigationTabs({
  currentScope,
  onSelectScope,
}: ScopeNavigationTabsProps) {
  const { t } = useTranslation();

  const SCOPE_ITEMS: { id: ScopeFilter; label: string; icon: React.ReactNode }[] = [
    {
      id: 'ALL',
      label: t('scope.all'),
      icon: <Sparkles className="h-4 w-4 text-emerald-500" />,
    },
    {
      id: 'DOMESTIC',
      label: t('scope.domestic'),
      icon: <Building2 className="h-4 w-4 text-amber-500" />,
    },
    {
      id: 'GLOBAL',
      label: t('scope.international'),
      icon: <Globe className="h-4 w-4 text-blue-500" />,
    },
    {
      id: 'SERIES',
      label: t('scope.series'),
      icon: <BookOpen className="h-4 w-4 text-emerald-500" />,
    },
  ];

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/80 dark:border-slate-800 pt-2"
      role="tablist"
      aria-label="Scope and category feeds"
    >
      {SCOPE_ITEMS.map((item) => {
        const isActive = currentScope === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectScope(item.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all duration-150 relative cursor-pointer whitespace-nowrap',
              isActive
                ? 'text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50/70 dark:bg-emerald-950/40 border-b-2 border-emerald-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
