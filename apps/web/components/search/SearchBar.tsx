'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { CommandPalette } from './CommandPalette';

export function SearchBar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [shortcutKey, setShortcutKey] = useState('Ctrl+K');

  useEffect(() => {
    // Detect Mac platform
    if (typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
      setShortcutKey('⌘K');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t('common.search')}
        className="group relative flex items-center justify-between w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-medium hover:border-blue-500/50 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        <span className="truncate text-slate-600 dark:text-slate-300 font-medium">{t('header.searchPrompt')}</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
          {shortcutKey}
        </kbd>
      </button>

      {isOpen && <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}
