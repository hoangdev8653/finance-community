'use client';

import React from 'react';
import { ThreadedComment } from '@/types/comments';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  comments: ThreadedComment[];
  onReply: (parentId: string, body: string) => Promise<void>;
  onEdit: (commentId: string, body: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export function CommentList({
  comments,
  onReply,
  onEdit,
  onDelete,
}: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          level={0}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
