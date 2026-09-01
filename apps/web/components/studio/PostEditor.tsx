'use client';

import React from 'react';
import { Copy, Sparkles } from 'lucide-react';
import { CategorySelector } from './CategorySelector';
import { TagAutocompleteInput } from './TagAutocompleteInput';
import { SeoMetadataDrawer } from './SeoMetadataDrawer';
import { CoverImagePicker } from '@/components/media/CoverImagePicker';
import { DomainSelector } from './DomainSelector';
import { SeriesSelector } from './SeriesSelector';
import { RichTextEditor } from './RichTextEditor';

interface PostEditorProps {
  title: string; contentType: 'SERIES' | 'COMMUNITY'; categoryId?: string; domainId?: string;
  tags: string[]; coverMediaId?: string | null; body: string; metaTitle: string; metaDescription: string; isAdmin?: boolean;
  onTitleChange: (value: string) => void; onContentTypeChange: (value: 'SERIES' | 'COMMUNITY') => void;
  onCategoryChange: (value: string) => void; onDomainChange?: (value: string) => void; seriesId?: string; lessonOrder?: number;
  onSeriesChange?: (value: string) => void; onLessonOrderChange?: (value: number) => void; onTagsChange: (value: string[]) => void;
  onCoverMediaChange?: (value: string | null) => void; onPendingCoverFileChange?: (file: File | null) => void; onBodyChange: (value: string) => void; onGenerateDraft?: () => void; onPendingImagesChange?: (images: Map<string, File>) => void;
  isGeneratingDraft?: boolean; onMetaTitleChange: (value: string) => void; onMetaDescriptionChange: (value: string) => void; imagePlan?: { recommendedImageCount: number; reason: string; items: Array<{ type: 'cover' | 'content'; sectionTitle?: string | null; placement: string; aspectRatio: string; prompt: string; reason: string }> };
}

export function PostEditor(props: PostEditorProps) {
  const { title, contentType, categoryId, domainId, tags, coverMediaId, body, metaTitle, metaDescription, isAdmin = false, seriesId, lessonOrder = 1, isGeneratingDraft = false } = props;
  const plainBody = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const sections = Array.from(body.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>\s*(?:<p[^>]*>(.*?)<\/p>)?/gi))
    .map((match) => `${match[1].replace(/<[^>]+>/g, '')}: ${(match[2] || '').replace(/<[^>]+>/g, '')}`.trim())
    .filter(Boolean);
  const topic = title || 'chủ đề bài viết';
  const avatarPrompt = props.imagePlan?.items.find((item) => item.type === 'cover')?.prompt || `Ảnh đại diện cho bài viết giáo dục về "${topic}". Thể hiện trực quan ý chính: ${plainBody.slice(0, 280) || topic}. Phong cách editorial hiện đại, chuyên nghiệp, bố cục ngang 16:9, không chữ, không logo.`;
  const contentItems = props.imagePlan?.items.filter((item) => item.type === 'content') || [];
  const contentPrompt = contentItems.length ? contentItems.map((item, index) => `Ảnh ${index + 1} — Section: ${item.sectionTitle || 'Nội dung chính'}\nVị trí: ${item.placement} | Tỷ lệ: ${item.aspectRatio}\nMục đích: ${item.reason}\nPrompt: ${item.prompt}`).join('\n\n') : (sections.length ? sections.slice(0, 3) : [plainBody || topic]).map((section, index) => `Ảnh minh họa số ${index + 1} cho phần "${section}" trong bài viết "${topic}". Tạo hình ảnh cụ thể giúp người đọc hiểu nội dung, phong cách editorial hiện đại, tỷ lệ ngang, không chữ sai chính tả, không logo.`).join('\n\n');
  const copyPrompt = (prompt: string) => void navigator.clipboard?.writeText(prompt);
  return <div className="space-y-6">
    <div className="space-y-4 rounded-lg border border-border bg-surface p-4 shadow-2xs sm:p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="w-full flex-1 space-y-1.5"><div className="flex items-center justify-between text-xs"><label htmlFor="post-title-input" className="font-medium text-foreground">Tiêu đề bài viết <span className="text-danger">*</span></label><span className="font-mono text-muted-foreground">{title.length} / 300</span></div><input id="post-title-input" type="text" value={title} onChange={(event) => props.onTitleChange(event.target.value)} maxLength={300} placeholder="Ví dụ: Lãi kép là gì và cách áp dụng trong thực tế?" className="h-10 w-full rounded-md border border-input bg-background px-3 text-base text-foreground" /></div>
        <div className="shrink-0 space-y-1.5"><span className="block text-xs font-medium text-foreground">Loại nội dung</span><div className={`inline-flex rounded-md border px-3 py-1.5 text-xs font-mono font-semibold ${isAdmin ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-border bg-muted text-foreground'}`}>BÀI HỌC / SERIES</div></div>
      </div>
      <div className="grid grid-cols-1 gap-4 border-t border-border/60 pt-2 sm:grid-cols-2"><DomainSelector value={domainId} onChange={props.onDomainChange ?? (() => undefined)} /><CategorySelector value={categoryId} scope={contentType} domainId={domainId} onChange={props.onCategoryChange} /><SeriesSelector value={seriesId} lessonOrder={lessonOrder} domainId={domainId} onChange={props.onSeriesChange ?? (() => undefined)} onOrderChange={props.onLessonOrderChange ?? (() => undefined)} /><TagAutocompleteInput selectedTags={tags} onChange={props.onTagsChange} /></div>
      {props.onCoverMediaChange && <div className="grid gap-4 border-t border-border/60 pt-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]"><div><CoverImagePicker value={coverMediaId || null} onChange={props.onCoverMediaChange} onPendingFileChange={props.onPendingCoverFileChange} /></div><div className="space-y-3 rounded-lg border border-border bg-background/40 p-4"><div><h3 className="text-sm font-semibold text-foreground">Gợi ý prompt tạo ảnh</h3><p className="mt-1 text-xs text-muted-foreground">Sao chép prompt để dùng trong GPT hoặc công cụ tạo ảnh.</p></div><div className="space-y-2"><label className="text-xs font-medium text-foreground">Ảnh đại diện</label><div className="flex items-stretch gap-2"><textarea readOnly value={avatarPrompt} className="min-h-28 flex-1 resize-y rounded-md border border-input bg-background p-3 text-xs leading-5 text-foreground" /><button type="button" onClick={() => copyPrompt(avatarPrompt)} className="h-10 shrink-0 self-start rounded-md border border-primary px-3 text-xs font-semibold text-primary hover:bg-primary/10" aria-label="Sao chép prompt ảnh đại diện"><Copy className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />Sao chép</button></div></div><div className="space-y-2"><label className="text-xs font-medium text-foreground">Ảnh trong nội dung (tối đa 3 ảnh)</label><div className="flex items-stretch gap-2"><textarea readOnly value={contentPrompt} className="min-h-28 flex-1 resize-y rounded-md border border-input bg-background p-3 text-xs leading-5 text-foreground" /><button type="button" onClick={() => copyPrompt(contentPrompt)} className="h-10 shrink-0 self-start rounded-md border border-primary px-3 text-xs font-semibold text-primary hover:bg-primary/10" aria-label="Sao chép prompt ảnh nội dung"><Copy className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />Sao chép</button></div></div></div></div>}
    </div>
    <div className="space-y-2"><div className="flex items-center justify-between"><label className="text-sm font-medium text-foreground">Nội dung bài viết</label>{props.onGenerateDraft && <button type="button" onClick={props.onGenerateDraft} disabled={isGeneratingDraft} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 text-sm font-semibold text-primary hover:bg-primary/20 disabled:opacity-60"><Sparkles className="h-4 w-4" aria-hidden="true" />{isGeneratingDraft ? 'Đang tạo bản nháp...' : 'AI tạo bản nháp'}</button>}</div><p className="text-xs text-muted-foreground">Bạn có thể chèn ảnh, bảng, liên kết và định dạng nội dung trực tiếp tại vị trí mong muốn.</p><RichTextEditor value={body} onChange={props.onBodyChange} onPendingImagesChange={props.onPendingImagesChange} /></div>
    <SeoMetadataDrawer metaTitle={metaTitle} metaDescription={metaDescription} onMetaTitleChange={props.onMetaTitleChange} onMetaDescriptionChange={props.onMetaDescriptionChange} />
  </div>;
}
