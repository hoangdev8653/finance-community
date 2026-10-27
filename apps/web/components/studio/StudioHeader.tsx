'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Eye, EyeOff, Save, Send } from 'lucide-react';

interface StudioHeaderProps {
  isEditing: boolean;
  isCommunityOnly?: boolean;
  isAdminStudio?: boolean;
  backHref?: string;
  isPreview: boolean;
  isSavingDraft: boolean;
  isPublishing: boolean;
  onTogglePreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  primaryActionLabel?: string;
}

export function StudioHeader({
  isEditing,
  isCommunityOnly = false,
  isAdminStudio = false,
  backHref = '/',
  isPreview,
  isSavingDraft,
  isPublishing,
  onTogglePreview,
  onSaveDraft,
  onPublish,
  primaryActionLabel,
}: StudioHeaderProps) {
  const isPending = isSavingDraft || isPublishing;
  const router = useRouter();

  const handleBack = () => {
    const historyIndex = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof historyIndex === 'number' && historyIndex > 0) {
      router.back();
      return;
    }
    router.push(backHref);
  };

  return (
    <header className="flex flex-col items-start justify-between gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-slate-200/70 bg-card text-slate-700 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-slate-700/70 dark:text-slate-300"
          aria-label={isAdminStudio ? 'Quay lại trang quản trị bài học' : 'Quay lại trang trước'}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            {isAdminStudio
              ? isEditing ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'
              : isEditing ? 'Chỉnh sửa bài viết' : isCommunityOnly ? 'Viết bài cộng đồng' : 'Soạn thảo bài viết mới'}
          </h1>
          <p className="text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
            {isAdminStudio
              ? 'Soạn nội dung và phân loại bài học trong chương trình đào tạo.'
              : isEditing
                ? 'Cập nhật nội dung bài viết hoặc bản nháp'
                : isCommunityOnly
                  ? 'Chia sẻ kinh nghiệm, đặt câu hỏi hoặc trao đổi cùng cộng đồng BrewSeven.'
                  : 'Soạn thảo và xuất bản ấn phẩm nghiên cứu, nhận định thị trường hoặc bài học'}
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
          className="h-10 gap-2 rounded-[8px] border-slate-200/70 px-4 text-sm font-bold text-slate-700 transition-all hover:bg-muted dark:border-slate-700/70 dark:text-slate-200"
        >
          {isPreview ? <><EyeOff className="h-4 w-4 text-muted-foreground" /><span>Thoát xem trước</span></> : <><Eye className="h-4 w-4 text-muted-foreground" /><span>Xem trước</span></>}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          isLoading={isSavingDraft}
          disabled={isPending}
          className="h-10 gap-2 rounded-[8px] border-slate-200/70 px-4 text-sm font-bold text-slate-700 transition-all hover:bg-muted dark:border-slate-700/70 dark:text-slate-200"
        >
          <Save className="h-4 w-4 text-muted-foreground" />
          <span>Lưu nháp</span>
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onPublish}
          isLoading={isPublishing}
          disabled={isPending}
          className="h-10 gap-2 rounded-[8px] bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
          <span>{primaryActionLabel || (isEditing ? '\u0043\u1eadp nh\u1eadt' : '\u0047\u1eedi xu\u1ea5t b\u1ea3n')}</span>
        </Button>
      </div>
    </header>
  );
}
