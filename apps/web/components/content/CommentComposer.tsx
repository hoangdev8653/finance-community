'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { MessageSquare, LogIn } from 'lucide-react';

interface CommentComposerProps {
  onSubmit: (body: string) => Promise<void>;
  isLoading?: boolean;
}

export function CommentComposer({ onSubmit, isLoading = false }: CommentComposerProps) {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-5 text-center space-y-3">
        <div className="flex justify-center text-muted-foreground">
          <MessageSquare className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-sm text-foreground font-medium">
          Sign in to join the discussion
        </p>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Share your market perspective, ask questions about the valuation model, or challenge assumptions.
        </p>
        <div className="pt-1">
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname || '/')}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
            Sign In to Comment
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError('Comment cannot be empty.');
      return;
    }
    if (trimmed.length > 2000) {
      setError('Comment exceeds the 2000 character limit.');
      return;
    }

    try {
      setError(null);
      await onSubmit(trimmed);
      setBody('');
    } catch {
      setError('Failed to post comment. Please try again.');
    }
  };

  const authorHandle = user?.email ? user.email.split('@')[0] : 'Analyst';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>
          Commenting as <strong className="text-foreground font-medium">@{authorHandle}</strong>
        </span>
        <span>{body.length} / 2000</span>
      </div>

      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={3}
          disabled={isLoading}
          aria-label="Write a comment"
          placeholder="Contribute analytical insight, valuation context, or market data..."
          className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y"
        />
        {error && (
          <p className="text-xs text-danger font-medium mt-1">{error}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !body.trim()}
          isLoading={isLoading}
        >
          Post Comment
        </Button>
      </div>
    </form>
  );
}
