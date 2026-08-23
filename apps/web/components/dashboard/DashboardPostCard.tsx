'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Edit3, Eye, Trash2, Send, Archive, RotateCcw } from 'lucide-react';
import { PostEntity } from '../../types/content';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/DropdownMenu';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface DashboardPostCardProps {
  post: PostEntity;
  onUpdateStatus?: (postId: string, status: 'PUBLISHED' | 'ARCHIVED' | 'DRAFT') => Promise<unknown>;
  onDeletePost?: (postId: string) => Promise<unknown>;
}

export function DashboardPostCard({
  post,
  onUpdateStatus,
  onDeletePost,
}: DashboardPostCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger'> = {
    PUBLISHED: 'success',
    DRAFT: 'warning',
    ARCHIVED: 'secondary',
    HIDDEN: 'danger',
  };

  const handleStatusChange = async (newStatus: 'PUBLISHED' | 'ARCHIVED' | 'DRAFT') => {
    if (!onUpdateStatus) return;
    try {
      setIsMutating(true);
      await onUpdateStatus(post.id, newStatus);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeletePost) return;
    try {
      setIsDeleting(true);
      await onDeletePost(post.id);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const publicUrl =
    post.status === 'PUBLISHED'
      ? `/posts/${post.contentType.toLowerCase()}/${encodeURIComponent(post.slug)}`
      : `/posts/${post.id}/edit`;

  return (
    <article className="rounded-lg border border-border bg-surface p-5 transition-shadow hover:shadow-xs flex flex-col justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] uppercase font-mono py-0 px-1.5">
              {post.contentType}
            </Badge>
            <Badge
              variant={statusVariants[post.status] || 'secondary'}
              className="text-[10px] uppercase font-mono py-0 px-1.5"
            >
              {post.status}
            </Badge>
          </div>

          {/* Action Menu */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Post actions"
                  disabled={isMutating}
                  className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/posts/${post.id}/edit`} className="flex items-center cursor-pointer">
                    <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Edit in Studio</span>
                  </Link>
                </DropdownMenuItem>

                {post.status === 'DRAFT' && onUpdateStatus && (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('PUBLISHED')}
                    className="cursor-pointer"
                  >
                    <Send className="mr-2 h-4 w-4 text-emerald-500" />
                    <span>Publish Draft</span>
                  </DropdownMenuItem>
                )}

                {post.status === 'PUBLISHED' && onUpdateStatus && (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('ARCHIVED')}
                    className="cursor-pointer"
                  >
                    <Archive className="mr-2 h-4 w-4 text-amber-500" />
                    <span>Archive Note</span>
                  </DropdownMenuItem>
                )}

                {post.status === 'ARCHIVED' && onUpdateStatus && (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('DRAFT')}
                    className="cursor-pointer"
                  >
                    <RotateCcw className="mr-2 h-4 w-4 text-sky-500" />
                    <span>Restore to Draft</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Post</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h3 className="font-heading text-xl font-bold tracking-tight text-slate-950 dark:text-slate-100 line-clamp-2">
          <Link href={publicUrl} className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            {post.title}
          </Link>
        </h3>

        {post.metaDescription && (
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 line-clamp-2 font-normal leading-relaxed">{post.metaDescription}</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-4 font-medium">
          <span className="flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200">
            <Eye className="h-4 w-4 text-slate-500" />
            <span>{(post.viewCount || 0).toLocaleString()} lượt xem</span>
          </span>
          <span>{formattedDate}</span>
        </div>

        <Button variant="ghost" size="sm" asChild className="h-8 text-sm font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950">
          <Link href={`/posts/${post.id}/edit`}>Chỉnh sửa</Link>
        </Button>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        postTitle={post.title}
        isDeleting={isDeleting}
      />
    </article>
  );
}
