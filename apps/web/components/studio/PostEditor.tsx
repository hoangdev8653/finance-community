'use client';

import React, { useRef } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { CategorySelector } from './CategorySelector';
import { TagInput } from './TagInput';
import { SeoMetadataDrawer } from './SeoMetadataDrawer';
import { CoverImagePicker } from '@/components/media/CoverImagePicker';

interface PostEditorProps {
  title: string;
  contentType: 'SERIES' | 'COMMUNITY' | 'NEWS';
  categoryId?: string;
  tags: string[];
  coverMediaId?: string | null;
  body: string;
  metaTitle: string;
  metaDescription: string;
  isAdmin?: boolean;
  onTitleChange: (val: string) => void;
  onContentTypeChange: (val: 'SERIES' | 'COMMUNITY' | 'NEWS') => void;
  onCategoryChange: (val: string) => void;
  onTagsChange: (val: string[]) => void;
  onCoverMediaChange?: (val: string | null) => void;
  onBodyChange: (val: string) => void;
  onMetaTitleChange: (val: string) => void;
  onMetaDescriptionChange: (val: string) => void;
}

export function PostEditor({
  title,
  contentType,
  categoryId,
  tags,
  coverMediaId,
  body,
  metaTitle,
  metaDescription,
  isAdmin = false,
  onTitleChange,
  onContentTypeChange,
  onCategoryChange,
  onTagsChange,
  onCoverMediaChange,
  onBodyChange,
  onMetaTitleChange,
  onMetaDescriptionChange,
}: PostEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToolbarInsert = (
    prefix: string,
    suffix: string = '',
    defaultText: string = ''
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newBody =
      body.substring(0, start) + replacement + body.substring(end);
    onBodyChange(newBody);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Title & Content Type Selector */}
      <div className="space-y-4 rounded-lg border border-border bg-surface p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-1.5 flex-1 w-full">
            <div className="flex justify-between items-center text-xs">
              <label
                htmlFor="post-title-input"
                className="font-medium text-foreground"
              >
                Analysis Title <span className="text-danger">*</span>
              </label>
              <span className="font-mono text-xs text-muted-foreground">
                {title.length} / 300
              </span>
            </div>
            <input
              id="post-title-input"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              maxLength={300}
              placeholder="e.g. Q3 2026 Sovereign Yield Curve Dynamics & Macro Implications..."
              className="w-full h-10 rounded-md border border-input bg-background px-3 font-heading text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Content Type Radio / Switch */}
          <div className="space-y-1.5 shrink-0">
            <label className="block text-xs font-medium text-foreground">
              Scope
            </label>
            {isAdmin ? (
              <div className="flex items-center rounded-md border border-border bg-background p-0.5">
                <button
                  type="button"
                  onClick={() => onContentTypeChange('COMMUNITY')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors cursor-pointer ${
                    contentType === 'COMMUNITY'
                      ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  COMMUNITY
                </button>
                <button
                  type="button"
                  onClick={() => onContentTypeChange('SERIES')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors cursor-pointer ${
                    contentType === 'SERIES'
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  SERIES (Admin)
                </button>
                <button
                  type="button"
                  onClick={() => onContentTypeChange('NEWS')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors cursor-pointer ${
                    contentType === 'NEWS'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  NEWS (Admin)
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-mono font-semibold text-foreground">
                <span>COMMUNITY</span>
                <span className="text-3xs font-sans text-muted-foreground">(Thảo luận cộng đồng)</span>
              </div>
            )}
          </div>
        </div>

        {/* Category & Tags Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          <CategorySelector
            value={categoryId}
            scope={contentType}
            onChange={onCategoryChange}
          />
          <TagInput tags={tags} onChange={onTagsChange} />
        </div>

        {/* Cover Image Picker */}
        {onCoverMediaChange && (
          <div className="pt-2 border-t border-border/60">
            <CoverImagePicker
              value={coverMediaId || null}
              onChange={onCoverMediaChange}
            />
          </div>
        )}
      </div>

      {/* Markdown Body Editor */}
      <div className="space-y-1.5">
        <label
          htmlFor="post-body-input"
          className="block text-xs font-medium text-foreground"
        >
          Research Content & Valuation Body
        </label>
        <div className="rounded-lg shadow-2xs">
          <EditorToolbar onInsert={handleToolbarInsert} />
          <textarea
            id="post-body-input"
            ref={textareaRef}
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            rows={16}
            placeholder="Structure your institutional investment thesis, valuation tables, DCF assumptions, risk factors..."
            className="w-full rounded-b-lg border border-input bg-background p-4 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary resize-y"
          />
        </div>
      </div>

      {/* SEO Configuration Drawer */}
      <SeoMetadataDrawer
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        onMetaTitleChange={onMetaTitleChange}
        onMetaDescriptionChange={onMetaDescriptionChange}
      />
    </div>
  );
}
