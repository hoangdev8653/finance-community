'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Globe } from 'lucide-react';

interface SeoMetadataDrawerProps {
  metaTitle: string;
  metaDescription: string;
  onMetaTitleChange: (val: string) => void;
  onMetaDescriptionChange: (val: string) => void;
}

export function SeoMetadataDrawer({
  metaTitle,
  metaDescription,
  onMetaTitleChange,
  onMetaDescriptionChange,
}: SeoMetadataDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-4 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span>Xem trước SEO trên công cụ tìm kiếm</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-4 border-t border-border/60 mt-1">
          {/* Meta Title */}
          <div className="space-y-1.5 pt-3">
            <div className="flex justify-between items-center text-xs">
              <label
                htmlFor="seo-meta-title"
                className="font-medium text-foreground"
              >
                Tiêu đề SEO
              </label>
              <span className="font-mono text-xs text-muted-foreground">
                {metaTitle.length} / 70
              </span>
            </div>
            <input
              id="seo-meta-title"
              type="text"
              value={metaTitle}
              onChange={(e) => onMetaTitleChange(e.target.value)}
              maxLength={70}
              placeholder="Nhập tiêu đề hiển thị trên kết quả tìm kiếm Google..."
              className="h-10 w-full rounded-sm border border-slate-300 bg-slate-50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label
                htmlFor="seo-meta-desc"
                className="font-medium text-foreground"
              >
                Mô tả SEO
              </label>
              <span className="font-mono text-xs text-muted-foreground">
                {metaDescription.length} / 160
              </span>
            </div>
            <textarea
              id="seo-meta-desc"
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              maxLength={160}
              rows={2}
              placeholder="Nhập mô tả ngắn hiển thị trong kết quả tìm kiếm..."
              className="w-full resize-y rounded-sm border border-slate-300 bg-slate-50 p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>
      )}
    </div>
  );
}
