'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePostReactions, useTogglePostReaction } from '@/lib/reactions/use-reactions';
import { usePostBookmark } from '@/lib/posts/use-post-bookmark';
import { Heart, MessageCircle, Bookmark, Share2, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PostStickyReactionsProps {
  postId: string;
  commentCount?: number;
}

export function PostStickyReactions({ postId, commentCount }: PostStickyReactionsProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { data: reactionData } = usePostReactions(postId);
  const toggleMutation = useTogglePostReaction(postId);
  const { isBookmarked, isLoading: isBookmarkLoading, toggleBookmark } = usePostBookmark(postId);

  const [copied, setCopied] = useState(false);

  const totalLikes = reactionData?.total ?? 0;
  const userReacted = reactionData?.userReacted ?? false;

  const handleToggleReaction = () => {
    if (!isAuthenticated) {
      const redirectUrl = `/dang-nhap?redirect=${encodeURIComponent(pathname || '/')}`;
      router.push(redirectUrl);
      return;
    }
    toggleMutation.mutate();
  };

  const handleScrollToComments = () => {
    const commentsEl = document.getElementById('comments');
    if (commentsEl) {
      commentsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignore clipboard write error
    }
  };

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28 flex flex-col items-center gap-1 overflow-hidden rounded-xl border border-border/80 bg-card p-1.5 shadow-xs">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleToggleReaction}
          disabled={toggleMutation.isPending}
          title={userReacted ? 'Bỏ thích' : 'Thích bài viết'}
          className={cn(
            'flex w-12 flex-col items-center gap-1 rounded-lg py-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95',
            userReacted
              ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Heart
            className={cn('h-4 w-4 transition-transform', userReacted && 'fill-rose-500 text-rose-500 scale-110')}
          />
          <span className="text-[11px] font-mono tabular-nums leading-none">
            {totalLikes}
          </span>
        </button>

        {/* Scroll to Comments */}
        <button
          type="button"
          onClick={handleScrollToComments}
          title="Xem thảo luận"
          className="flex w-12 flex-col items-center gap-1 rounded-lg py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer active:scale-95"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-[11px] font-mono tabular-nums leading-none">
            {commentCount !== undefined ? commentCount : 0}
          </span>
        </button>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={toggleBookmark}
          disabled={isBookmarkLoading}
          title={isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
          className={cn(
            'flex w-12 flex-col items-center gap-1 rounded-lg py-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95',
            isBookmarked
              ? 'text-primary bg-primary/10 dark:bg-primary/20'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Bookmark className={cn('h-4 w-4 transition-transform', isBookmarked && 'fill-current scale-105')} />
          <span className="text-[11px] leading-none">{isBookmarked ? 'Đã lưu' : 'Lưu'}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          title="Chia sẻ liên kết"
          className="flex w-12 flex-col items-center gap-1 rounded-lg py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer active:scale-95"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] text-emerald-600 font-medium leading-none">Đã chép</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span className="text-[11px] leading-none">Chia sẻ</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
