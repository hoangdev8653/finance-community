'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCommentReactions, useToggleCommentReaction } from '@/lib/reactions/use-reactions';
import { ReactionButton } from './ReactionButton';

interface CommentReactionButtonProps {
  commentId: string;
}

export function CommentReactionButton({ commentId }: CommentReactionButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { data: reactionData } = useCommentReactions(commentId);
  const toggleMutation = useToggleCommentReaction(commentId);

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

  return (
    <ReactionButton
      total={total}
      userReacted={userReacted}
      onToggle={handleToggleReaction}
      isLoading={toggleMutation.isPending}
      size="sm"
      labelPrefix="Like comment"
      className="min-h-[32px] px-2.5"
    />
  );
}
