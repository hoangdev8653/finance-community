'use client';

import React, { useRef } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { CategorySelector } from './CategorySelector';
import { TagInput } from './TagInput';
import { SeoMetadataDrawer } from './SeoMetadataDrawer';
import { CoverImagePicker } from '@/components/media/CoverImagePicker';
import { DomainSelector } from './DomainSelector';
import { SeriesSelector } from './SeriesSelector';
import { Sparkles } from 'lucide-react';

interface PostEditorProps {
  title: string;
  contentType: 'SERIES' | 'COMMUNITY' | 'NEWS';
  categoryId?: string;
  domainId?: string;
  tags: string[];
  coverMediaId?: string | null;
  body: string;
  metaTitle: string;
  metaDescription: string;
  isAdmin?: boolean;
  onTitleChange: (val: string) => void;
  onContentTypeChange: (val: 'SERIES' | 'COMMUNITY' | 'NEWS') => void;
  onCategoryChange: (val: string) => void;
  onDomainChange?: (val: string) => void;
  seriesId?: string;
  lessonOrder?: number;
  onSeriesChange?: (val: string) => void;
  onLessonOrderChange?: (val: number) => void;
  onTagsChange: (val: string[]) => void;
  onCoverMediaChange?: (val: string | null) => void;
  onBodyChange: (val: string) => void;
  onGenerateDraft?: () => void;
  isGeneratingDraft?: boolean;
  onMetaTitleChange: (val: string) => void;
  onMetaDescriptionChange: (val: string) => void;
}

export function PostEditor({
  title,
  contentType,
  categoryId,
  domainId,
  tags,
  coverMediaId,
  body,
  metaTitle,
  metaDescription,
  isAdmin = false,
  onTitleChange,
  onContentTypeChange,
  onCategoryChange,
  onDomainChange,
  seriesId,
  lessonOrder = 1,
  onSeriesChange,
  onLessonOrderChange,
  onTagsChange,
  onCoverMediaChange,
  onBodyChange,
  onGenerateDraft,
  isGeneratingDraft = false,
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
                Tiêu đề bài học <span className="text-danger">*</span>
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
              placeholder="Ví dụ: Lãi kép là gì và cách áp dụng trong thực tế?"
              className="w-full h-10 rounded-md border border-input bg-background px-3 font-heading text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Learning content type is fixed to SERIES. */}
          <div className="space-y-1.5 shrink-0">
            <label className="block text-xs font-medium text-foreground">Loại nội dung</label>
            {isAdmin ? (
              <div className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono font-semibold text-emerald-400">BÀI HỌC / SERIES</div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-mono font-semibold text-foreground">
                <span>BÀI HỌC / SERIES</span>
              </div>
            )}
          </div>
        </div>

        {/* Category & Tags Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          <DomainSelector value={domainId} onChange={onDomainChange ?? (() => undefined)} />
          <CategorySelector
            value={categoryId}
            scope={contentType}
            domainId={domainId}
            onChange={onCategoryChange}
          />
          <SeriesSelector value={seriesId} lessonOrder={lessonOrder} domainId={domainId} onChange={onSeriesChange ?? (() => undefined)} onOrderChange={onLessonOrderChange ?? (() => undefined)} />
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
        {onGenerateDraft && <div className="flex justify-end"><button type="button" onClick={onGenerateDraft} disabled={isGeneratingDraft} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 text-sm font-semibold text-primary hover:bg-primary/20 disabled:opacity-60"><Sparkles className="h-4 w-4" />{isGeneratingDraft ? 'Đang tạo bản nháp...' : 'AI tạo bản nháp'}</button></div>}
        <label
          htmlFor="post-body-input"
          className="block text-xs font-medium text-foreground"
        >
          Nội dung bài học
        </label>
        <div className="rounded-lg shadow-2xs">
          <EditorToolbar onInsert={handleToolbarInsert} />
          <textarea
            id="post-body-input"
            ref={textareaRef}
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            rows={16}
            placeholder="Viết nội dung bài học, ví dụ minh họa, các bước thực hành và phần tổng kết..."
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
