'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Layers, X } from 'lucide-react';
import type { DomainEntity } from '@/types/content';
import { getDomainColorTheme } from '@/lib/utils/domain-colors';

interface DomainFilterDropdownProps {
  domains: DomainEntity[];
  selectedDomainId: string;
  onSelect: (domainId: string) => void;
  domainCounts?: Record<string, number>;
  totalCount?: number;
  className?: string;
}

export function DomainFilterDropdown({
  domains,
  selectedDomainId,
  onSelect,
  domainCounts = {},
  totalCount,
  className = '',
}: DomainFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedDomain = domains.find((d) => d.id === selectedDomainId);
  const selectedTheme = selectedDomain ? getDomainColorTheme(selectedDomain, domains) : null;
  const selectedName = selectedDomain ? selectedDomain.nameVi || selectedDomain.name : null;

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-11 items-center justify-between gap-3 rounded-[8px] border px-4 text-sm font-medium transition-all shadow-2xs ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-card'
            : 'border-slate-200/80 dark:border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted/60 text-foreground'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedDomain && selectedTheme ? (
            <>
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${selectedTheme.dot} shadow-xs`} />
              <span className="truncate font-semibold text-foreground">{selectedName}</span>
              {domainCounts[selectedDomain.id] !== undefined && (
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {domainCounts[selectedDomain.id]}
                </span>
              )}
            </>
          ) : (
            <>
              <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-foreground font-semibold">Tất cả lĩnh vực</span>
              {totalCount !== undefined && (
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {totalCount}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
          {selectedDomain && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onSelect('ALL');
              }}
              className="rounded p-0.5 hover:bg-slate-100 dark:hover:bg-muted hover:text-foreground transition-colors"
              title="Bỏ lọc lĩnh vực"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-[10px] border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-card/95 backdrop-blur-md p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_10px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.8)] ring-1 ring-slate-900/10 dark:ring-white/10 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Option: Tất cả lĩnh vực */}
          <button
            type="button"
            onClick={() => {
              onSelect('ALL');
              setIsOpen(false);
            }}
            className={`flex w-full items-center justify-between gap-2.5 rounded-[6px] px-3 py-2.5 text-xs transition-colors ${
              selectedDomainId === 'ALL'
                ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-foreground shadow-2xs'
                : 'text-foreground hover:bg-slate-100/70 dark:hover:bg-muted/60'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">Tất cả lĩnh vực</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {totalCount !== undefined && (
                <span className="rounded bg-slate-200/80 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-mono text-muted-foreground font-bold">
                  {totalCount}
                </span>
              )}
              {selectedDomainId === 'ALL' && (
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </div>
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-slate-100 dark:border-border/60" />

          {/* List of Domains with distinct colors */}
          <div className="space-y-0.5">
            {domains.map((domain) => {
              const theme = getDomainColorTheme(domain, domains);
              const isSelected = selectedDomainId === domain.id;
              const count = domainCounts[domain.id];
              const name = domain.nameVi || domain.name;

              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => {
                    onSelect(domain.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-[6px] px-3 py-2.5 text-xs transition-all ${
                    isSelected
                      ? `${theme.bg} ${theme.text} font-semibold border ${theme.border} shadow-2xs`
                      : 'text-foreground hover:bg-slate-100/70 dark:hover:bg-muted/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${theme.dot} ring-2 ring-white/50 shadow-xs`} />
                    <span className="truncate">{name}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {count !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${
                          isSelected
                            ? `${theme.bg} ${theme.text}`
                            : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                    {isSelected && (
                      <Check className={`h-4 w-4 ${theme.text} shrink-0`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
