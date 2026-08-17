'use client';

import React from 'react';
import Link from 'next/link';
import { PenSquare, FileText, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { PostEntity } from '../../types/content';
import { DashboardTabType } from '../../types/dashboard';
import { DashboardPostCard } from './DashboardPostCard';
import { Button } from '../ui/Button';

interface DashboardPostsListProps {
  posts: PostEntity[];
  isLoading: boolean;
  isError: boolean;
  activeTab: DashboardTabType;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onUpdateStatus?: (postId: string, status: 'PUBLISHED' | 'ARCHIVED' | 'DRAFT') => Promise<unknown>;
  onDeletePost?: (postId: string) => Promise<unknown>;
}

export function DashboardPostsList({
  posts,
  isLoading,
  isError,
  activeTab,
  page,
  totalPages,
  onPageChange,
  onUpdateStatus,
  onDeletePost,
}: DashboardPostsListProps) {
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
        <h4 className="font-serif font-bold text-foreground">Failed to Load Research Notes</h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          An error occurred while fetching your research portfolio. Please refresh or try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page)}>
          Retry
        </Button>
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    const emptyMessages = {
      published: {
        title: 'No Published Research Notes',
        description: 'You haven\'t published any financial analyses yet. Share your market models and insights with the community.',
        cta: 'Write Analysis',
      },
      drafts: {
        title: 'No Active Drafts',
        description: 'Your workspace is clear. Ready to begin your next valuation model or market report?',
        cta: 'Create Draft',
      },
      archived: {
        title: 'No Archived Notes',
        description: 'Archived research articles will be organized here.',
        cta: 'Create Analysis',
      },
    };

    const empty = emptyMessages[activeTab] || emptyMessages.published;

    return (
      <div className="rounded-lg border border-dashed border-border bg-surface/50 p-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <FileText className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-serif text-lg font-bold text-foreground">{empty.title}</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">{empty.description}</p>
        </div>
        <Button variant="primary" size="sm" asChild>
          <Link href="/posts/create" className="inline-flex items-center gap-1.5">
            <PenSquare className="h-4 w-4" />
            <span>{empty.cta}</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <DashboardPostCard
            key={post.id}
            post={post}
            onUpdateStatus={onUpdateStatus}
            onDeletePost={onDeletePost}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-muted-foreground font-mono">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="h-8 px-2"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
