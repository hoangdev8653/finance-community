'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Eye, EyeOff, Save, Send } from 'lucide-react';

interface StudioHeaderProps {
  isEditing: boolean;
  isPreview: boolean;
  isSavingDraft: boolean;
  isPublishing: boolean;
  onTogglePreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function StudioHeader({
  isEditing,
  isPreview,
  isSavingDraft,
  isPublishing,
  onTogglePreview,
  onSaveDraft,
  onPublish,
}: StudioHeaderProps) {
  const isPending = isSavingDraft || isPublishing;

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
          aria-label="Back to home feed"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
            {isEditing ? 'Chỉnh sửa bài học' : 'Tạo bài học'}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            {isEditing ? 'Cập nhật nội dung bài học hoặc bản nháp' : 'Soạn thảo và xuất bản nội dung học tập'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {/* Preview Toggle Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
          className="font-mono text-xs gap-1.5"
        >
          {isPreview ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>Thoát xem trước</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
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
          className="font-mono text-xs gap-1.5"
        >
          <Save className="h-3.5 w-3.5" />
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
          className="font-mono text-xs gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{isEditing ? 'Cập nhật' : 'Gửi duyệt'}</span>
        </Button>
      </div>
    </header>
  );
}
