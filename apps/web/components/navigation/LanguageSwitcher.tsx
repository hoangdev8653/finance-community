'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { VietnamFlag, USAFlag } from '@/components/icons/FlagIcons';
import { cn } from '@/lib/utils/cn';

export interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'segmented' | 'icon-only';
}

export function LanguageSwitcher({
  className,
  variant = 'dropdown',
}: LanguageSwitcherProps) {
  const { locale, setLocale, toggleLocale, isVietnamese } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 select-none',
          className
        )}
        role="group"
        aria-label="Language selector"
      >
        <button
          type="button"
          onClick={() => setLocale('vi')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
            isVietnamese
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <VietnamFlag className="h-3 w-4" />
          <span>VI</span>
        </button>
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
            !isVietnamese
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <USAFlag className="h-3 w-4" />
          <span>EN</span>
        </button>
      </div>
    );
  }

  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={toggleLocale}
        className={cn(
          'inline-flex items-center justify-center h-10 w-10 rounded-xl',
          'border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
          'transition-colors select-none cursor-pointer',
          className
        )}
        title={isVietnamese ? 'Chuyển sang Tiếng Anh (US)' : 'Chuyển sang Tiếng Việt'}
        aria-label="Toggle language"
      >
        {isVietnamese ? (
          <VietnamFlag className="h-4 w-6 shadow-xs" />
        ) : (
          <USAFlag className="h-4 w-6 shadow-xs" />
        )}
      </button>
    );
  }

  // Default dropdown variant
  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center justify-between gap-2 h-10 px-3 rounded-xl',
          'border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800',
          'text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all select-none cursor-pointer shadow-2xs'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Chọn ngôn ngữ"
      >
        <div className="flex items-center gap-2">
          {isVietnamese ? (
            <VietnamFlag className="h-3.5 w-5" />
          ) : (
            <USAFlag className="h-3.5 w-5" />
          )}
          <span className="font-mono font-bold tracking-tight">
            {isVietnamese ? 'VI' : 'EN'}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200',
            isOpen && 'rotate-180 text-blue-600 dark:text-blue-400'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-40 origin-top-right rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
          role="menu"
          aria-orientation="vertical"
        >
          <button
            type="button"
            onClick={() => {
              setLocale('vi');
              setIsOpen(false);
            }}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer',
              isVietnamese
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            )}
            role="menuitem"
          >
            <div className="flex items-center gap-2.5">
              <VietnamFlag className="h-3.5 w-5" />
              <span>Tiếng Việt</span>
            </div>
            {isVietnamese && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setLocale('en');
              setIsOpen(false);
            }}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer mt-0.5',
              !isVietnamese
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            )}
            role="menuitem"
          >
            <div className="flex items-center gap-2.5">
              <USAFlag className="h-3.5 w-5" />
              <span>English (US)</span>
            </div>
            {!isVietnamese && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
          </button>
        </div>
      )}
    </div>
  );
}
