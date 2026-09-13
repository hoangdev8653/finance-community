'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePostReactions, useTogglePostReaction } from '@/lib/reactions/use-reactions';
import { ReactionButton } from './ReactionButton';
import { BookmarkButton } from '../content/BookmarkButton';
import { MessageSquare, Share2, Check } from 'lucide-react';

interface PostReactionsBarProps {
  postId: string;
  commentCount?: number;
}

export function PostReactionsBar({ postId, commentCount }: PostReactionsBarProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { data: reactionData } = usePostReactions(postId);
  const toggleMutation = useTogglePostReaction(postId);

  const [copied, setCopied] = useState(false);

  const total = reactionData?.total ?? 0;
  const userReacted = reactionData?.userReacted ?? false;

  const handleToggleReaction = () => {
    if (!isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || '/')}`;
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
      // Gracefully handle clipboard errors
    }
  };

  return (
    <section
      aria-label="Post engagement"
      className="my-6 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-4"
    >
      {/* Reactions & Comment Jump */}
      <div className="flex flex-wrap items-center gap-2">
        <ReactionButton
          total={total}
          userReacted={userReacted}
          onToggle={handleToggleReaction}
          isLoading={toggleMutation.isPending}
          size="md"
          labelPrefix="Like this research analysis"
        />

        <button
          type="button"
          onClick={handleScrollToComments}
          aria-label="Jump to discussion comments"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:hover:bg-slate-800"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          <span>{commentCount !== undefined ? `${commentCount} thảo luận` : 'Thảo luận'}</span>
        </button>
      </div>

      {/* Bookmark & Share Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <BookmarkButton postId={postId} variant="labeled" size="md" className="min-h-[44px]" />

        <button
          type="button"
          onClick={handleShare}
          aria-label="Share this analysis link"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:hover:bg-slate-800"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="text-primary font-medium">Đã sao chép</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Chia sẻ</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
