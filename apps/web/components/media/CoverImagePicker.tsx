'use client';

import React, { useState } from 'react';
import { useMediaDetail } from '@/lib/media/use-media';
import { MediaUploader } from './MediaUploader';
import { MediaItem } from '@/types/media';
import { ImageIcon } from 'lucide-react';

interface CoverImagePickerProps {
  value: string | null;
  onChange: (mediaId: string | null) => void;
  fallbackPreviewUrl?: string | null;
  className?: string;
}

const previewRegistry = new Map<string, string>();

export function registerCoverPreview(mediaId: string | null | undefined, url: string | null | undefined) {
  if (mediaId && url) previewRegistry.set(mediaId, url);
}

export function CoverImagePicker({
  value,
  onChange,
  fallbackPreviewUrl = null,
  className = '',
}: CoverImagePickerProps) {
  const { data: existingMedia } = useMediaDetail(value);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const previewUrl = localPreviewUrl || existingMedia?.secureUrl || fallbackPreviewUrl || (value ? previewRegistry.get(value) : null) || null;

  const handleUploadSuccess = (media: MediaItem) => {
    setLocalPreviewUrl(media.secureUrl);
    onChange(media.id);
  };

  const handleClear = () => {
    setLocalPreviewUrl(null);
    onChange(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <ImageIcon className="h-4 w-4 text-primary" aria-hidden="true" />
        <span>Cover Image (Optional)</span>
      </div>

      <MediaUploader
        purpose="cover"
        folder="posts"
        label="Upload article cover banner"
        currentPreviewUrl={previewUrl}
        onSuccess={handleUploadSuccess}
        onClear={handleClear}
      />
    </div>
  );
}
