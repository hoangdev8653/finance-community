'use client';

import React, { useState } from 'react';
import {
  usePostComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '@/lib/comments/use-comments';
import { buildCommentTree } from '@/lib/comments/comment-tree';
import { CommentComposer } from './CommentComposer';
import { CommentList } from './CommentList';
import { CommentSkeleton } from './CommentSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';
import { MessageSquare } from 'lucide-react';

interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const isDemoPost = postId === 'demo-community-article';
  const [page, setPage] = useState(1);
  const {
    data: commentsResponse,
    isLoading,
    isError,
    refetch,
  } = usePostComments(postId, { page, limit: 50 });

  const createMutation = useCreateComment(postId);
  const updateMutation = useUpdateComment(postId);
  const deleteMutation = useDeleteComment(postId);

  const handleCreateRoot = async (body: string, mediaId?: string) => {
    await createMutation.mutateAsync({ body, mediaId });
  };

  const handleReply = async (parentId: string, body: string) => {
    await createMutation.mutateAsync({ body, parentId });
  };

  const handleEdit = async (commentId: string, body: string) => {
    await updateMutation.mutateAsync({ commentId, dto: { body } });
  };

  const handleDelete = async (commentId: string) => {
    await deleteMutation.mutateAsync(commentId);
  };

  const comments = commentsResponse?.data || [];
  const totalItems = commentsResponse?.meta?.totalItems ?? comments.length;
  const threadedComments = buildCommentTree(comments);

  return (
    <section aria-labelledby="comments-heading" className="space-y-6 pt-10 mt-10 border-t border-border">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2
          id="comments-heading"
          className="font-heading text-2xl font-bold text-foreground flex items-center gap-2"
        >
          <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>Thảo luận ({totalItems})</span>
        </h2>
      </div>

      {/* Root Comment Composer */}
      <CommentComposer
        onSubmit={handleCreateRoot}
        isLoading={createMutation.isPending}
      />

      {/* State Transitions: Loading, Error, Empty, List */}
      {isLoading ? (
        <CommentSkeleton />
      ) : isError && !isDemoPost ? (
        <ErrorState
          title="Không thể tải thảo luận"
          message="Không thể tải bình luận cho bài viết này."
          onRetry={() => refetch()}
        />
      ) : threadedComments.length === 0 || isDemoPost ? (
        <EmptyState
          icon={MessageSquare}
          title="Chưa có bình luận"
          description="Hãy là người đầu tiên chia sẻ góc nhìn hoặc đặt câu hỏi về bài viết này."
        />
      ) : (
        <div className="space-y-6 pt-2">
          <CommentList
            comments={threadedComments}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination / Load More */}
          {commentsResponse?.meta?.hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                className="font-mono text-xs"
              >
                  Xem thêm bình luận
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
