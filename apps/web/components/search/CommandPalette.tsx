'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandPaletteSearch } from '@/lib/search/use-search';
import { Search, Tag, FolderTree, ArrowRight, X, CornerDownLeft, Loader2 } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results = [], isLoading } = useCommandPaletteSearch(query);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation within list
  const totalItems = results.length + (query.trim() ? 1 : 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalItems));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % Math.max(1, totalItems));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < results.length) {
        const item = results[selectedIndex];
        onClose();
        router.push(item.url);
      } else if (query.trim()) {
        onClose();
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Search Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-xl border border-border bg-background shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-surface/50">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search topics, categories, or tags... (Type to explore)"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden"
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
          {results.length > 0 && (
            <div className="space-y-1 pb-2">
              <div className="px-3 py-1.5 text-3xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Topics & Taxonomy
              </div>
              {results.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                const Icon = item.type === 'tag' ? Tag : FolderTree;

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onClose();
                      router.push(item.url);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-foreground hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-semibold truncate">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className={`text-2xs truncate ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-2xs font-mono shrink-0">
                      <span className="hidden sm:inline opacity-70">Jump</span>
                      <CornerDownLeft className="h-3.5 w-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fallback to deep search */}
          {query.trim() && (
            <div className="pt-2">
              <div
                role="option"
                aria-selected={selectedIndex === results.length}
                onClick={() => {
                  onClose();
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                }}
                onMouseEnter={() => setSelectedIndex(results.length)}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  selectedIndex === results.length
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground hover:bg-surface'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Search className={`h-4 w-4 shrink-0 ${selectedIndex === results.length ? 'text-primary-foreground' : 'text-primary'}`} />
                  <span className="text-xs font-mono">
                    Search all articles for &ldquo;<span className="font-semibold">{query.trim()}</span>&rdquo;
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </div>
            </div>
          )}

          {!isLoading && results.length === 0 && !query.trim() && (
            <div className="p-8 text-center text-xs text-muted-foreground font-mono">
              Type a topic, tag, or category to start searching...
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-2 text-3xs font-mono text-muted-foreground">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-background border border-border">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-background border border-border">Enter</kbd> to select</span>
          </div>
          <span><kbd className="px-1.5 py-0.5 rounded bg-background border border-border">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
