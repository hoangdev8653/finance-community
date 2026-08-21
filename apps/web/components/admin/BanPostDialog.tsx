'use client';

import React, { useState } from 'react';
import { ModerationPostItem } from '../../types/moderation';
import { Button } from '../ui/Button';
import { ShieldBan, X, AlertTriangle } from 'lucide-react';

interface BanPostDialogProps {
  post: ModerationPostItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function BanPostDialog({
  post,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: BanPostDialogProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await onConfirm(reason.trim());
    setReason('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ban-dialog-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3 text-danger">
            <div className="p-2 rounded-lg bg-danger/10">
              <ShieldBan className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="ban-dialog-title" className="font-serif text-lg font-bold text-foreground">
                Cấm & Tạm ẩn Bài viết
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Ẩn bài viết khỏi người dùng khác và lưu lý do vi phạm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 rounded-lg bg-muted/40 p-4 border border-border/60">
          <div className="text-2xs font-mono font-semibold uppercase text-muted-foreground">
            Thông tin bài viết vi phạm
          </div>
          <p className="text-sm font-semibold text-foreground line-clamp-2">
            {post.title}
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span>Tác giả: {post.author?.username || post.authorId}</span>
            <span>Loại: {post.contentType}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-warning/10 border border-warning/30 p-3 text-warning text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Bài viết sẽ chuyển sang trạng thái <strong>BANNED / HIDDEN</strong>. Chỉ Admin và Tác giả mới có thể xem lại.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="ban-reason"
              className="text-xs font-mono font-semibold text-foreground block"
            >
              Lý do cấm bài viết <span className="text-danger">*</span>
            </label>
            <textarea
              id="ban-reason"
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Chèn liên kết nhóm Zalo/Telegram lừa đảo, lôi kéo cam kết lợi nhuận..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!reason.trim() || isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Xác nhận Cấm bài viết'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
