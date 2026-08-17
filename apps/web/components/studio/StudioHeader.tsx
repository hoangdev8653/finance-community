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
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
            {isEditing ? 'Edit Financial Analysis' : 'Publishing Studio'}
          </h1>
          <p className="text-2xs text-muted-foreground font-mono">
            {isEditing ? 'Update published research or draft' : 'Draft and publish institutional-grade research notes'}
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
              <span>Exit Preview</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Live Preview</span>
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
          <span>Save Draft</span>
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
          <span>{isEditing ? 'Update Post' : 'Publish Now'}</span>
        </Button>
      </div>
    </header>
  );
}
