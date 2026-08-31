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
    <div className="rounded-lg border border-border bg-surface/40 overflow-hidden">
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
              className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
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
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary resize-y"
            />
          </div>
        </div>
      )}
    </div>
  );
}
