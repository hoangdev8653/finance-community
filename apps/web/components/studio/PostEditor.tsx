'use client';

import React, { useState } from 'react';
import { Copy, Sparkles, ChevronDown, ChevronUp, Image as ImageIcon, Check } from 'lucide-react';
import { CategorySelector } from './CategorySelector';
import { TagAutocompleteInput } from './TagAutocompleteInput';
import { SeoMetadataDrawer } from './SeoMetadataDrawer';
import { CoverImagePicker } from '@/components/media/CoverImagePicker';
import { DomainSelector } from './DomainSelector';
import { CourseSelector } from './CourseSelector';
import { RichTextEditor } from './RichTextEditor';
import { useToast } from '@/lib/toast/ToastContext';

interface PostEditorProps {
  title: string;
  contentType: 'SERIES' | 'COMMUNITY';
  categoryId?: string;
  domainId?: string;
  tags: string[];
  coverMediaId?: string | null;
  body: string;
  metaTitle: string;
  metaDescription: string;
  isAdmin?: boolean;
  communityOnly?: boolean;
  onTitleChange: (value: string) => void;
  onContentTypeChange: (value: 'SERIES' | 'COMMUNITY') => void;
  onCategoryChange: (value: string) => void;
  onDomainChange?: (value: string) => void;
  seriesId?: string;
  lessonOrder?: number;
  onSeriesChange?: (value: string) => void;
  onLessonOrderChange?: (value: number) => void;
  onTagsChange: (value: string[]) => void;
  onCoverMediaChange?: (value: string | null) => void;
  onPendingCoverFileChange?: (file: File | null) => void;
  onBodyChange: (value: string) => void;
  onGenerateDraft?: () => void;
  onPendingImagesChange?: (images: Map<string, File>) => void;
  isGeneratingDraft?: boolean;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  imagePlan?: {
    recommendedImageCount: number;
    reason: string;
    items: Array<{
      type: 'cover' | 'content';
      sectionTitle?: string | null;
      placement: string;
      aspectRatio: string;
      prompt: string;
      reason: string;
    }>;
  };
}

export function PostEditor(props: PostEditorProps) {
  const {
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
    communityOnly = false,
    seriesId,
    lessonOrder = 1,
    isGeneratingDraft = false,
  } = props;

  // User-facing community authoring must remain community-only even if a
  // stale draft or a shared editor state contains a SERIES value.
  const editorContentType = communityOnly ? 'COMMUNITY' : contentType;
  const canManageLearning = isAdmin && !communityOnly;

  const { toast } = useToast();
  const [showAiPrompts, setShowAiPrompts] = useState(false);
  const [copiedType, setCopiedType] = useState<'avatar' | 'content' | null>(null);

  const plainBody = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const sections = Array.from(body.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>\s*(?:<p[^>]*>(.*?)<\/p>)?/gi))
    .map((match) => `${match[1].replace(/<[^>]+>/g, '')}: ${(match[2] || '').replace(/<[^>]+>/g, '')}`.trim())
    .filter(Boolean);

  const topic = title || 'chủ đề bài viết';
  const avatarPrompt =
    props.imagePlan?.items.find((item) => item.type === 'cover')?.prompt ||
    `Ảnh đại diện cho bài viết giáo dục về "${topic}". Thể hiện trực quan ý chính: ${plainBody.slice(0, 280) || topic}. Phong cách editorial hiện đại, chuyên nghiệp, bố cục ngang 16:9, không chữ, không logo.`;

  const contentItems = props.imagePlan?.items.filter((item) => item.type === 'content') || [];
  const contentPrompt = contentItems.length
    ? contentItems
        .map(
          (item, index) =>
            `Ảnh ${index + 1} — Section: ${item.sectionTitle || 'Nội dung chính'}\nVị trí: ${item.placement} | Tỷ lệ: ${item.aspectRatio}\nMục đích: ${item.reason}\nPrompt: ${item.prompt}`
        )
        .join('\n\n')
    : (sections.length ? sections.slice(0, 3) : [plainBody || topic])
        .map(
          (section, index) =>
            `Ảnh minh họa số ${index + 1} cho phần "${section}" trong bài viết "${topic}". Tạo hình ảnh cụ thể giúp người đọc hiểu nội dung, phong cách editorial hiện đại, tỷ lệ ngang, không chữ sai chính tả, không logo.`
        )
        .join('\n\n');

  const handleCopyPrompt = (text: string, type: 'avatar' | 'content') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      toast.success(
        type === 'avatar'
          ? 'Đã sao chép prompt ảnh đại diện!'
          : 'Đã sao chép prompt ảnh nội dung!'
      );
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {/* ========================================================================= */}
      {/* CỘT TRÁI (70%): KHÔNG GIAN SOẠN THẢO VĂN BẢN (WRITING CANVAS)             */}
      {/* ========================================================================= */}
      <div className="min-w-0 self-start lg:col-span-8 space-y-6">
        {/* 1. Tiêu đề bài viết */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-card p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="post-title-input"
              className="block text-base font-bold text-slate-900 dark:text-slate-100"
            >
              Tiêu đề bài viết <span className="text-danger">*</span>
            </label>
            <span className="font-sans text-sm font-semibold text-slate-600 dark:text-slate-300">
              {title.length} / 300 ký tự
            </span>
          </div>
          <input
            id="post-title-input"
            type="text"
            value={title}
            onChange={(event) => props.onTitleChange(event.target.value)}
            maxLength={300}
            placeholder="Ví dụ: Lãi kép là gì và cách áp dụng trong tích lũy tài chính thực tế?"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* 2. Trình soạn thảo nội dung (Rich Text Editor) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <label className="block text-base font-bold text-slate-900 dark:text-slate-100">
                Nội dung bài viết <span className="text-danger">*</span>
              </label>
              <p className="text-sm leading-6 font-medium text-slate-700 dark:text-slate-300">
                Hỗ trợ tiêu đề H2/H3, in đậm, danh sách, trích dẫn, bảng số liệu và ảnh minh họa trực tiếp.
              </p>
            </div>

            {canManageLearning && props.onGenerateDraft && (
              <button
                type="button"
                onClick={props.onGenerateDraft}
                disabled={isGeneratingDraft}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 text-xs font-bold text-primary transition-all hover:bg-primary/20 hover:border-primary disabled:opacity-60 shadow-2xs self-start sm:self-auto"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>{isGeneratingDraft ? 'Đang tạo bản nháp AI...' : 'AI tạo bản nháp'}</span>
              </button>
            )}
          </div>

          <RichTextEditor
            value={body}
            onChange={props.onBodyChange}
            onPendingImagesChange={props.onPendingImagesChange}
          />
        </div>

        {/* 3. Tùy chỉnh SEO & Meta tags */}
        <SeoMetadataDrawer
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          onMetaTitleChange={props.onMetaTitleChange}
          onMetaDescriptionChange={props.onMetaDescriptionChange}
        />
      </div>

      {/* ========================================================================= */}
      {/* CỘT PHẢI (30%): CẤU HÌNH XUẤT BẢN & ẢNH BÌA (PUBLISHING SIDEBAR)           */}
      {/* ========================================================================= */}
      <div className="min-w-0 self-start lg:col-span-4 space-y-6">
        {/* Card 1: Cấu hình phân loại */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-card p-5 sm:p-6 shadow-sm space-y-5">
          <div className="border-b border-border/80 pb-3">
            <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100">
              Cài đặt phân loại
            </h2>
            <p className="mt-1 text-sm leading-6 font-medium text-slate-700 dark:text-slate-300">
              Định vị phạm vi và đối tượng hiển thị của bài viết
            </p>
          </div>

          {/* Phân loại loại nội dung */}
          <div className="space-y-1.5">
            <span className="block text-base font-bold text-slate-900 dark:text-slate-100">
              Loại nội dung
            </span>
            {canManageLearning ? (
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-900 p-1">
                <button
                  type="button"
                  onClick={() => props.onContentTypeChange('COMMUNITY')}
                  className={`rounded-lg py-2 text-xs font-bold transition-all ${
                    editorContentType === 'COMMUNITY'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  CỘNG ĐỒNG
                </button>
                <button
                  type="button"
                  onClick={() => props.onContentTypeChange('SERIES')}
                  className={`rounded-lg py-2 text-xs font-bold transition-all ${
                    editorContentType === 'SERIES'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  BÀI HỌC / KHÓA
                </button>
              </div>
            ) : (
              <div className="flex h-11 items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-900 px-3.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                {editorContentType === 'SERIES' ? 'BÀI HỌC / KHÓA' : 'BÀI VIẾT CỘNG ĐỒNG'}
              </div>
            )}
          </div>

          {/* Lĩnh vực */}
          <DomainSelector
            value={domainId}
            onChange={props.onDomainChange ?? (() => undefined)}
          />

          {/* Chủ đề / Chuyên mục */}
          <CategorySelector
            value={categoryId}
            scope={editorContentType}
            domainId={domainId}
            onChange={props.onCategoryChange}
          />

          {/* CHỈ HIỂN THỊ KHI LÀ BÀI HỌC KHÓA HỌC (SERIES) */}
          {!communityOnly && editorContentType === 'SERIES' && (
            <CourseSelector
              value={seriesId}
              lessonOrder={lessonOrder}
              domainId={domainId}
              onChange={props.onSeriesChange ?? (() => undefined)}
              onOrderChange={props.onLessonOrderChange ?? (() => undefined)}
            />
          )}

          {/* Thẻ chủ đề */}
          <TagAutocompleteInput
            selectedTags={tags}
            onChange={props.onTagsChange}
          />
        </div>

        {/* Card 2: Ảnh bìa đại diện */}
        {props.onCoverMediaChange && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b border-border/80 pb-3">
              <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100">
                Ảnh bìa bài viết
              </h2>
              <p className="mt-1 text-sm leading-6 font-medium text-slate-700 dark:text-slate-300">
                Xuất hiện trên thẻ bài viết và tiêu đề trang đọc
              </p>
            </div>

            <CoverImagePicker
              value={coverMediaId || null}
              onChange={props.onCoverMediaChange}
              onPendingFileChange={props.onPendingCoverFileChange}
            />

            {/* Trợ lý Prompt AI tạo ảnh (Collapsible Accordion) */}
            {canManageLearning && <div className="border-t border-border/70 pt-3">
              <button
                type="button"
                onClick={() => setShowAiPrompts((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border border-primary/25 bg-primary/5 px-3.5 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>Trợ lý prompt tạo ảnh AI</span>
                </div>
                {showAiPrompts ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showAiPrompts && (
                <div className="mt-3 space-y-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/60 p-3.5 animate-in fade-in duration-150">
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    Sao chép prompt được tối ưu sẵn để tạo ảnh trên Midjourney, DALL-E hoặc ChatGPT:
                  </p>

                  {/* Prompt Ảnh đại diện */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Ảnh đại diện (16:9)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(avatarPrompt, 'avatar')}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold text-primary hover:bg-primary/10"
                      >
                        {copiedType === 'avatar' ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedType === 'avatar' ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={3}
                      value={avatarPrompt}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed cursor-default select-all"
                    />
                  </div>

                  {/* Prompt Ảnh nội dung */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Ảnh minh họa nội dung
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(contentPrompt, 'content')}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold text-primary hover:bg-primary/10"
                      >
                        {copiedType === 'content' ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedType === 'content' ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={4}
                      value={contentPrompt}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed cursor-default select-all"
                    />
                  </div>
                </div>
              )}
            </div>}
          </div>
        )}
      </div>
    </div>
  );
}
