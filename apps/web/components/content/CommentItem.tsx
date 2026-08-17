'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { ThreadedComment } from '@/types/comments';
import { EditCommentForm } from './EditCommentForm';
import { ReplyComposer } from './ReplyComposer';
import { CommentReactionButton } from '@/components/reactions/CommentReactionButton';
import { ReportButton } from '@/components/moderation/ReportButton';
import { MessageSquare, Edit2, Trash2, Calendar } from 'lucide-react';

interface CommentItemProps {
  comment: ThreadedComment;
  level?: number;
  onReply: (parentId: string, body: string) => Promise<void>;
  onEdit: (commentId: string, body: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export function CommentItem({
  comment,
  level = 0,
  onReply,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const { isAuthenticated, user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isAuthor = Boolean(user && user.id === comment.authorId && !comment.isDeleted);
  const isModerator = Boolean(
    user &&
      user.roles &&
      (user.roles.includes('MODERATOR') ||
        user.roles.includes('ADMIN') ||
        user.roles.includes('SUPER_ADMIN'))
  );
  const canDelete = Boolean((isAuthor || isModerator) && !comment.isDeleted);

  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const authorName = comment.isDeleted
    ? '[deleted]'
    : comment.authorProfile?.displayName ||
      comment.authorProfile?.username ||
      `Analyst #${comment.authorId.slice(0, 8)}`;

  const profileUsername = !comment.isDeleted ? comment.authorProfile?.username : null;

  const handleEditSave = async (body: string) => {
    setIsActionLoading(true);
    try {
      await onEdit(comment.id, body);
      setIsEditing(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReplySubmit = async (body: string) => {
    setIsActionLoading(true);
    try {
      await onReply(comment.id, body);
      setIsReplying(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setIsActionLoading(true);
      try {
        await onDelete(comment.id);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  // Indentation styling: Level 0 full width, Level 1+ indented with thread line
  const isNested = level > 0;

  return (
    <div
      className={`space-y-3 ${
        isNested
          ? 'pl-4 sm:pl-6 border-l-2 border-border/60 my-4'
          : 'rounded-lg border border-border bg-surface p-4 sm:p-5 shadow-2xs my-4'
      }`}
    >
      {/* Comment Header */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {profileUsername ? (
            <Link
              href={`/profile/${encodeURIComponent(profileUsername)}`}
              className="font-mono font-medium text-foreground hover:text-primary transition-colors"
            >
              @{authorName}
            </Link>
          ) : (
            <span
              className={`font-mono font-medium ${
                comment.isDeleted ? 'text-muted-foreground italic' : 'text-foreground'
              }`}
            >
              @{authorName}
            </span>
          )}

          <span className="text-muted-foreground">•</span>

          <span className="text-muted-foreground font-mono flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            <time dateTime={comment.createdAt}>{formattedDate}</time>
          </span>

          {comment.updatedAt !== comment.createdAt && !comment.isDeleted && (
            <span className="text-muted-foreground/80 font-mono italic">(edited)</span>
          )}
        </div>

        {/* Actions: Edit, Delete, Report */}
        {!comment.isDeleted && (
          <div className="flex items-center gap-1">
            {isAuthor && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isActionLoading}
                aria-label="Edit comment"
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isActionLoading}
                aria-label="Delete comment"
                className="p-1 rounded text-muted-foreground hover:text-danger hover:bg-muted transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}

            {!isAuthor && (
              <ReportButton
                targetType="COMMENT"
                targetId={comment.id}
                className="hover:bg-muted"
              />
            )}
          </div>
        )}
      </div>

      {/* Comment Body / Edit Form */}
      {isEditing ? (
        <EditCommentForm
          initialBody={comment.body}
          onSave={handleEditSave}
          onCancel={() => setIsEditing(false)}
          isLoading={isActionLoading}
        />
      ) : (
        <p
          className={`text-sm leading-relaxed ${
            comment.isDeleted
              ? 'italic text-muted-foreground'
              : 'text-foreground/90 whitespace-pre-wrap font-sans'
          }`}
        >
          {comment.body}
        </p>
      )}

      {/* Actions Bar: Reactions & Reply Trigger Button */}
      {!comment.isDeleted && !isEditing && (
        <div className="flex items-center gap-3 pt-1">
          <CommentReactionButton commentId={comment.id} />

          {isAuthenticated && !isReplying && (
            <button
              type="button"
              onClick={() => setIsReplying(true)}
              disabled={isActionLoading}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-mono transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded px-1.5 py-0.5"
            >
              <MessageSquare className="h-3 w-3" aria-hidden="true" />
              Reply
            </button>
          )}
        </div>
      )}

      {/* Inline Reply Composer */}
      {isReplying && (
        <ReplyComposer
          parentUsername={authorName}
          onReply={handleReplySubmit}
          onCancel={() => setIsReplying(false)}
          isLoading={isActionLoading}
        />
      )}

      {/* Child Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3 pt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={level + 1}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
