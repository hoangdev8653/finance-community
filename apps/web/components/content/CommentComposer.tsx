'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useUploadMedia } from '@/lib/media/use-media';
import { useToast } from '@/lib/toast/ToastContext';
import { useRateLimitTimer } from '@/lib/utils/use-rate-limit-timer';
import { Button } from '@/components/ui/Button';
import { MessageSquare, LogIn, ImagePlus, X, Loader2, Clock } from 'lucide-react';

interface CommentComposerProps {
  onSubmit: (body: string, mediaId?: string) => Promise<void>;
  isLoading?: boolean;
}

export function CommentComposer({ onSubmit, isLoading = false }: CommentComposerProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const { secondsRemaining, isRateLimited, handleApiError } = useRateLimitTimer();
  const pathname = usePathname();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Attached media state
  const [attachedMedia, setAttachedMedia] = useState<{ id: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadMedia, isPending: isUploading } = useUploadMedia();

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-5 text-center space-y-3">
        <div className="flex justify-center text-muted-foreground">
          <MessageSquare className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-sm text-foreground font-medium">
          Đăng nhập để tham gia thảo luận
        </p>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Share your market perspective, ask questions about the valuation model, or challenge assumptions.
        </p>
        <div className="pt-1">
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname || '/')}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
            Đăng nhập để bình luận
          </Link>
        </div>
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh tối đa 5MB.');
      return;
    }

    try {
      setError(null);
      const media = await uploadMedia({ file, purpose: 'content' });
      setAttachedMedia({ id: media.id, url: media.secureUrl });
      toast.success('Đã tải ảnh lên thành công!');
    } catch {
      setError('Không thể tải ảnh lên. Vui lòng thử lại.');
      toast.error('Không thể tải ảnh lên.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRateLimited) return;

    const trimmed = body.trim();
    if (!trimmed) {
      setError('Comment cannot be empty.');
      return;
    }
    if (trimmed.length > 2000) {
      setError('Comment exceeds the 2000 character limit.');
      return;
    }

    try {
      setError(null);
      await onSubmit(trimmed, attachedMedia?.id);
      setBody('');
      setAttachedMedia(null);
      toast.success('Đã gửi bình luận thành công!');
    } catch (err: any) {
      if (handleApiError(err)) {
        toast.warning('Bạn đang thao tác quá nhanh. Vui lòng đợi đếm ngược.');
      } else {
        const msg = err?.response?.data?.message || 'Không thể đăng bình luận. Vui lòng thử lại.';
        setError(msg);
        toast.error(msg);
      }
    }
  };

  const authorHandle = user?.email ? user.email.split('@')[0] : 'Analyst';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>
          Commenting as <strong className="text-foreground font-medium">@{authorHandle}</strong>
        </span>
        <span>{body.length} / 2000</span>
      </div>

      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={3}
          disabled={isLoading || isUploading || isRateLimited}
          aria-label="Write a comment"
          placeholder="Chia sẻ góc nhìn phân tích, số liệu định giá, hoặc đính kèm ảnh biểu đồ..."
          className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y"
        />

        {/* Attached image preview */}
        {attachedMedia && (
          <div className="mt-2 relative inline-block rounded-lg overflow-hidden border border-border">
            <img
              src={attachedMedia.url}
              alt="Ảnh đính kèm"
              className="h-20 w-auto object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => setAttachedMedia(null)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
              title="Xóa ảnh"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {isRateLimited && (
          <div className="flex items-center gap-1.5 text-xs text-warning font-mono font-semibold mt-1.5 p-2 rounded-md bg-warning/10 border border-warning/30">
            <Clock className="h-3.5 w-3.5" />
            <span>Giới hạn tần suất: Vui lòng chờ {secondsRemaining}s trước khi gửi tiếp.</span>
          </div>
        )}

        {error && !isRateLimited && (
          <p className="text-xs text-danger font-medium mt-1">{error}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
            id="comment-image-upload"
          />
          <label
            htmlFor="comment-image-upload"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors ${
              isUploading || isRateLimited ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5 text-primary" />
            )}
            <span>{isUploading ? 'Đang tải ảnh...' : 'Đính kèm Biểu đồ'}</span>
          </label>
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={isLoading || isUploading || isRateLimited || !body.trim()}
          isLoading={isLoading}
        >
          {isRateLimited ? `Chờ ${secondsRemaining}s...` : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
}
