'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { CommandPalette } from './CommandPalette';

export function SearchBar() {
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
        aria-label="Open search dialog"
        className="group relative flex items-center justify-between w-full h-9 pl-9 pr-3 text-xs rounded-md border border-input bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all cursor-pointer"
      >
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="truncate">Search analysis, tags, or topics...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-3xs font-mono font-medium text-muted-foreground shadow-2xs">
          {shortcutKey}
        </kbd>
      </button>

      {isOpen && <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}
