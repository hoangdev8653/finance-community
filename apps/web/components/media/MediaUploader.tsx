'use client';

import React, { useRef, useState } from 'react';
import { useUploadMedia } from '@/lib/media/use-media';
import { validateMediaFile } from '@/lib/media/upload-client';
import { MediaItem } from '@/types/media';
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MediaUploaderProps {
  purpose?: 'avatar' | 'cover' | 'content';
  folder?: string;
  onSuccess: (media: MediaItem) => void;
  onError?: (error: Error) => void;
  className?: string;
  label?: string;
  currentPreviewUrl?: string | null;
  onClear?: () => void;
  deferUpload?: boolean;
  onFileSelected?: (file: File) => void;
}

export function MediaUploader({
  purpose = 'content',
  folder,
  onSuccess,
  onError,
  className = '',
  label = 'Upload Image',
  currentPreviewUrl,
  onClear,
  deferUpload = false,
  onFileSelected,
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const { mutateAsync: uploadMedia, isPending, uploadProgress } = useUploadMedia();

  const handleFile = async (file: File) => {
    setClientError(null);

    const validation = validateMediaFile(file);
    if (!validation.valid) {
      const err = validation.error || 'Invalid file.';
      setClientError(err);
      onError?.(new Error(err));
      return;
    }

    try {
      if (deferUpload) {
        onFileSelected?.(file);
        return;
      }
      const media = await uploadMedia({
        file,
        purpose,
        folder,
      });
      onSuccess(media);
    } catch (err: any) {
      const message = err?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.';
      setClientError(message);
      onError?.(err instanceof Error ? err : new Error(message));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset file input value so re-selecting same file triggers change
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const triggerPicker = () => {
    if (!isPending) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isPending) {
      e.preventDefault();
      triggerPicker();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="sr-only"
        id="media-uploader-input"
        disabled={isPending}
      />

      {/* Preview / Drop Zone */}
      {currentPreviewUrl ? (
        <div className="relative rounded-lg border border-border bg-surface overflow-hidden group">
          <img
            src={currentPreviewUrl}
            alt="Uploaded preview"
            className="max-h-[520px] w-full rounded-lg object-contain bg-black/10"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerPicker}
              disabled={isPending}
              className="bg-background text-foreground"
            >
              Replace
            </Button>
            {onClear && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onClear}
                disabled={isPending}
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
                <span>Remove</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={triggerPicker}
          onKeyDown={handleKeyDown}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          aria-label={label}
          className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-lg border-2 border-dashed transition-colors cursor-pointer text-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 bg-surface'
          } ${isPending ? 'pointer-events-none opacity-60' : ''}`}
        >
          {isPending ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-xs font-mono text-foreground font-medium">
                  Uploading ({uploadProgress}%)
                </p>
                <div
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                  className="w-44 h-1.5 bg-muted rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-primary transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                <Upload className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  <span className="text-primary hover:underline">Nhấn để tải ảnh lên</span> hoặc kéo thả
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  PNG, JPG, WebP, GIF up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screen Reader Progress Announcements */}
      <div aria-live="polite" className="sr-only">
        {isPending && `Uploading image, ${uploadProgress} percent complete.`}
      </div>

      {/* Error Message */}
      {clientError && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 rounded-md bg-danger/10 border border-danger/20 text-xs text-danger font-medium"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{clientError}</span>
        </div>
      )}
    </div>
  );
}
