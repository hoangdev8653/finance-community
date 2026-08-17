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

        <h3 className="font-serif text-lg font-bold tracking-tight text-foreground line-clamp-2">
          <Link href={publicUrl} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h3>

        {post.metaDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2">{post.metaDescription}</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-mono">
            <Eye className="h-3.5 w-3.5" />
            <span>{(post.viewCount || 0).toLocaleString()} views</span>
          </span>
          <span className="text-[11px]">{formattedDate}</span>
        </div>

        <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
          <Link href={`/posts/${post.id}/edit`}>Edit</Link>
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
