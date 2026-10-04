'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useUploadMedia } from '@/lib/media/use-media';
import { useToast } from '@/lib/toast/ToastContext';
import { useRateLimitTimer } from '@/lib/utils/use-rate-limit-timer';
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
      <div className="rounded-xl border border-border/80 bg-card p-6 text-center shadow-xs">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-3 font-heading text-base font-bold text-foreground">
          Đăng nhập để tham gia thảo luận
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs sm:text-sm leading-6 text-muted-foreground">
          Chia sẻ góc nhìn, đặt câu hỏi và trao đổi một cách tôn trọng với cộng đồng.
        </p>
        <div className="mt-4">
          <Link
            href={`/dang-nhap?redirect=${encodeURIComponent(pathname || '/')}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 shadow-xs cursor-pointer"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
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
      <div className="flex items-center text-xs sm:text-sm text-foreground/85 font-sans pb-1">
        <span className="flex items-center gap-1.5">
          <span className="font-medium">Bình luận với tư cách</span>
          <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/80">
            @{authorHandle}
          </span>
        </span>
      </div>

      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={5}
          disabled={isLoading || isUploading || isRateLimited}
          aria-label="Viết bình luận"
          placeholder="Chia sẻ góc nhìn phân tích, số liệu định giá, hoặc đính kèm ảnh biểu đồ..."
          className="w-full min-h-[140px] sm:min-h-[160px] resize-y rounded-xl border border-input bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-2xs"
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

      <div className="flex items-center justify-between pt-1">
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
            title="Đính kèm ảnh biểu đồ hoặc bảng tính phân tích (PNG, JPG, WebP tối đa 5MB)"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card text-xs font-medium text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 cursor-pointer transition-all duration-150 active:scale-95 shadow-2xs ${
              isUploading || isRateLimited ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>{isUploading ? 'Đang tải ảnh...' : 'Đính kèm Biểu đồ'}</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || isUploading || isRateLimited || !body.trim()}
          className={`inline-flex items-center justify-center gap-2 h-10 px-5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            !body.trim()
              ? 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer active:scale-[0.98]'
          }`}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{isRateLimited ? `Chờ ${secondsRemaining}s...` : 'Gửi bình luận'}</span>
        </button>
      </div>
    </form>
  );
}
