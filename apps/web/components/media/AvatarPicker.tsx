'use client';

import React, { useRef, useState } from 'react';
import { useUploadMedia, useMediaDetail } from '@/lib/media/use-media';
import { validateMediaFile } from '@/lib/media/upload-client';
import { User, Camera, Loader2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AvatarPickerProps {
  value: string | null;
  currentAvatarUrl?: string | null;
  onChange: (avatarMediaId: string | null) => void;
  className?: string;
}

export function AvatarPicker({
  value,
  currentAvatarUrl,
  onChange,
  className = '',
}: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: mediaDetail } = useMediaDetail(value);

  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const { mutateAsync: uploadMedia, isPending } = useUploadMedia();

  const previewUrl = localPreviewUrl || mediaDetail?.secureUrl || currentAvatarUrl || null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setClientError(null);

    const validation = validateMediaFile(file);
    if (!validation.valid) {
      setClientError(validation.error || 'Invalid file.');
      return;
    }

    try {
      const media = await uploadMedia({
        file,
        purpose: 'avatar',
        folder: 'avatars',
      });
      setLocalPreviewUrl(media.secureUrl);
      onChange(media.id);
    } catch (err: any) {
      setClientError(err?.message || 'Failed to upload avatar.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleRemove = () => {
    setLocalPreviewUrl(null);
    onChange(null);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="sr-only"
        id="avatar-picker-input"
        disabled={isPending}
      />

      {/* Circular Avatar Container */}
      <div className="relative h-20 w-20 rounded-full border-2 border-border overflow-hidden bg-muted flex items-center justify-center group shrink-0">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile avatar preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        )}

        {/* Hover / Loading Overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          aria-label="Upload new profile picture"
          className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 focus-visible:opacity-100 focus-visible:outline-hidden cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <Camera className="h-4 w-4" aria-hidden="true" />
              <span className="text-3xs font-mono">Edit</span>
            </>
          )}
        </button>
      </div>

      {/* Actions & Instructions */}
      <div className="space-y-1.5 text-center sm:text-left">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isPending}
            className="text-xs"
          >
            <Camera className="h-3.5 w-3.5 mr-1" />
            <span>{previewUrl ? 'Change Avatar' : 'Upload Avatar'}</span>
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isPending}
              aria-label="Remove avatar"
              className="text-xs text-muted-foreground hover:text-danger"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              <span>Remove</span>
            </Button>
          )}
        </div>

        <p className="text-xs font-mono text-muted-foreground">
          PNG, JPG, WebP up to 10MB
        </p>

        {clientError && (
          <div role="alert" className="flex items-center gap-1 text-xs text-danger font-medium pt-0.5">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{clientError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
