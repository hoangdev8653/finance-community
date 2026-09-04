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
      className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface shadow-2xs my-6"
    >
      {/* Reactions & Comment Jump */}
      <div className="flex items-center gap-3">
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
          className="inline-flex items-center gap-2 text-sm font-mono font-medium px-3.5 py-2 min-h-[44px] rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          <span>{commentCount !== undefined ? commentCount : 'Comments'}</span>
        </button>
      </div>

      {/* Bookmark & Share Actions */}
      <div className="flex items-center gap-2.5">
        <BookmarkButton postId={postId} variant="labeled" size="md" className="min-h-[44px]" />

        <button
          type="button"
          onClick={handleShare}
          aria-label="Share this analysis link"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground px-3 py-2 min-h-[44px] rounded-md border border-border/60 hover:bg-muted/40 transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="text-primary font-medium">Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
