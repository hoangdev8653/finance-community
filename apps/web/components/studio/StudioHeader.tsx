'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Eye, EyeOff, Save, Send } from 'lucide-react';

interface StudioHeaderProps {
  isEditing: boolean;
  isCommunityOnly?: boolean;
  isPreview: boolean;
  isSavingDraft: boolean;
  isPublishing: boolean;
  onTogglePreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function StudioHeader({
  isEditing,
  isCommunityOnly = false,
  isPreview,
  isSavingDraft,
  isPublishing,
  onTogglePreview,
  onSaveDraft,
  onPublish,
}: StudioHeaderProps) {
  const isPending = isSavingDraft || isPublishing;

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
      <div className="flex items-center gap-3.5">
        <Link
          href="/"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-card text-slate-700 dark:text-slate-300 shadow-2xs transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Quay lại trang chủ"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {isEditing ? 'Chỉnh sửa bài viết' : isCommunityOnly ? 'Viết bài cộng đồng' : 'Soạn thảo bài viết mới'}
          </h1>
          <p className="text-sm leading-6 font-medium text-slate-600 dark:text-slate-300">
            {isEditing
              ? 'Cập nhật nội dung bài viết hoặc bản nháp'
              : isCommunityOnly
                ? 'Chia sẻ kinh nghiệm, đặt câu hỏi hoặc trao đổi cùng cộng đồng BrewSeven.'
                : 'Soạn thảo và xuất bản ấn phẩm nghiên cứu, nhận định thị trường hoặc bài học'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {/* Preview Toggle Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
          className="h-10 gap-2 rounded-xl border-slate-300 dark:border-slate-700 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-muted"
        >
          {isPreview ? (
            <>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
              <span>Thoát xem trước</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>Xem trước</span>
            </>
          )}
        </Button>

        {/* Save Draft */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          isLoading={isSavingDraft}
          disabled={isPending}
          className="h-10 gap-2 rounded-xl border-slate-300 dark:border-slate-700 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-muted"
        >
          <Save className="h-4 w-4 text-muted-foreground" />
          <span>Lưu nháp</span>
        </Button>

        {/* Publish */}
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onPublish}
          isLoading={isPublishing}
          disabled={isPending}
          className="h-10 gap-2 rounded-xl bg-primary hover:bg-primary/90 px-5 text-sm font-bold text-primary-foreground shadow-sm transition-all"
        >
          <Send className="h-4 w-4" />
          <span>{isEditing ? 'Cập nhật' : 'Gửi xuất bản'}</span>
        </Button>
      </div>
    </header>
  );
}
