'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTags } from '../../lib/posts/use-posts-feed';
import { Hash, X, TrendingUp } from 'lucide-react';

const normalizeTag = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .toLowerCase()
  .replace(/^#/, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80);

interface TagAutocompleteInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagAutocompleteInput({
  selectedTags,
  onChange,
  maxTags = 5,
}: TagAutocompleteInputProps) {
  const [inputQuery, setInputQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchTerm = inputQuery.replace(/^#/, '').trim();
  const isHashtagInput = /^#[a-zA-Z0-9À-ỹ][a-zA-Z0-9À-ỹ\s-]*$/.test(inputQuery.trim());
  const { data: suggestions = [] } = useTags(searchTerm, 8);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = (tagName: string) => {
    const formatted = normalizeTag(tagName);
    if (!formatted) return;

    if (!selectedTags.includes(formatted) && selectedTags.length < maxTags) {
      onChange([...selectedTags, formatted]);
    }
    setInputQuery('');
    setIsOpen(false);
  };

  const handleRemoveTag = (tagName: string) => {
    onChange(selectedTags.filter((t) => t !== tagName));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputQuery);
    } else if (e.key === 'Backspace' && !inputQuery && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className="space-y-2.5 relative">
      <label className="text-xs font-mono font-semibold text-foreground flex items-center justify-between">
        <span>Thẻ chủ đề ({selectedTags.length}/{maxTags})</span>
        <span className="text-xs text-muted-foreground">Nhấn Enter hoặc phẩy để thêm</span>
      </label>

      {/* Selected Tags Chips & Input Box */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-border bg-background min-h-10 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-semibold"
          >
            <Hash className="h-3 w-3" />
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="hover:text-danger hover:bg-danger/10 p-0.5 rounded-xs transition-colors"
              title="Xóa tag"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {selectedTags.length < maxTags && (
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => {
              setInputQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? "Tìm thẻ (ví dụ: tài chính, kỹ năng sống)..." : "Thêm thẻ..."}
            className={`flex-1 min-w-[120px] bg-transparent text-sm placeholder:text-muted-foreground focus:outline-hidden px-1.5 py-0.5 font-sans ${isHashtagInput ? 'font-bold text-primary' : 'text-foreground'}`}
          />
        )}
      </div>

      {/* Autocomplete Dropdown with TikTok-style Post Counts */}
      {isOpen && isHashtagInput && searchTerm && (suggestions.length > 0 || searchTerm) && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 rounded-lg border border-border bg-surface shadow-xl overflow-hidden animate-in fade-in duration-100 max-h-60 overflow-y-auto">
          {searchTerm && !suggestions.some((s) => normalizeTag(s.name) === normalizeTag(searchTerm)) && (
            <button
              type="button"
              onClick={() => handleAddTag(inputQuery)}
              className="w-full flex items-center justify-between px-3.5 py-3 text-left hover:bg-muted transition-colors border-b border-border/60"
            >
              <div className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
                <Hash className="h-3.5 w-3.5 text-primary" />
                <span>#{normalizeTag(searchTerm)}</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">0 bài viết</span>
            </button>
          )}

          {suggestions.map((item: any) => {
            const isSelected = selectedTags.includes(item.name);
            const usageCount = item.postCount ?? 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAddTag(item.name)}
                disabled={isSelected}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors ${
                  isSelected
                    ? 'opacity-40 cursor-not-allowed bg-muted/20'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 font-mono">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold">#{normalizeTag(item.name)}</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-muted-foreground/70" />
                  <span>{usageCount.toLocaleString('vi-VN')} bài viết</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
