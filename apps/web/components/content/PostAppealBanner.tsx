'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PostDetailResponse } from '../../types/content';
import { postsService } from '../../lib/posts/posts-service';
import { useAuth } from '../../lib/auth/AuthContext';
import { Button } from '../ui/Button';
import { AlertOctagon, Send, CheckCircle2, Edit3 } from 'lucide-react';

interface PostAppealBannerProps {
  post: PostDetailResponse;
}

export function PostAppealBanner({ post }: PostAppealBannerProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isBannedOrHidden =
    post.status === 'HIDDEN' || post.moderationStatus === 'BANNED';

  if (!isBannedOrHidden) return null;

  const isAuthor = user?.id && user.id === post.authorId;

  const handleRequestReview = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await postsService.requestReview(post.id);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="mb-8 rounded-xl border border-danger/40 bg-danger/5 dark:bg-danger/10 p-5 space-y-4 animate-in fade-in"
      role="alert"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-danger/15 text-danger shrink-0">
          <AlertOctagon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base font-bold text-foreground">
              Bài viết đang ở trạng thái Tạm ẩn / Chưa được công khai
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-danger/15 text-danger font-mono text-2xs font-semibold">
              {post.moderationStatus === 'BANNED' ? 'BANNED' : 'HIDDEN'}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Nội dung này hiện chỉ có <strong>Admin</strong> và <strong>Chính tác giả</strong> mới có thể xem.
          </p>

          {post.moderationReason && (
            <div className="rounded-lg bg-surface/80 border border-border/80 p-3 mt-2 text-xs font-mono">
              <span className="font-semibold text-danger">Lý do từ Hệ thống / Kiểm duyệt viên: </span>
              <span className="text-foreground">{post.moderationReason}</span>
            </div>
          )}
        </div>
      </div>

      {isAuthor && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-danger/20 text-xs font-mono">
          <span className="text-muted-foreground">
            Hãy chỉnh sửa nội dung bài viết cho phù hợp với tiêu chuẩn cộng đồng trước khi gửi duyệt lại.
          </span>

          <div className="flex items-center gap-2">
            <Link
              href={`/posts/${post.contentType.toLowerCase()}/edit?id=${post.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground hover:bg-muted font-semibold transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Chỉnh sửa nội dung</span>
            </Link>

            {isSubmitted ? (
              <span className="inline-flex items-center gap-1.5 text-success font-semibold px-3 py-1.5 rounded-lg bg-success/10 border border-success/30">
                <CheckCircle2 className="h-4 w-4" />
                <span>Đã gửi yêu cầu xem xét lại</span>
              </span>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRequestReview}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu duyệt lại'}</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-danger font-mono font-semibold pt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
