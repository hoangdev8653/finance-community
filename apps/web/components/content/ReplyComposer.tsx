'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ReplyComposerProps {
  parentUsername: string;
  onReply: (body: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ReplyComposer({
  parentUsername,
  onReply,
  onCancel,
  isLoading = false,
}: ReplyComposerProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError('Reply cannot be empty.');
      return;
    }
    if (trimmed.length > 2000) {
      setError('Reply exceeds the 2000 character limit.');
      return;
    }

    try {
      setError(null);
      await onReply(trimmed);
      setBody('');
    } catch {
      setError('Failed to submit reply. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-3 pl-4 sm:pl-6 border-l-2 border-primary/40 my-3">
      <div className="text-xs text-muted-foreground font-mono">
        Replying to <span className="text-primary font-semibold">@{parentUsername}</span>
      </div>

      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={3}
          disabled={isLoading}
          aria-label={`Reply to @${parentUsername}`}
          placeholder="Share your analytical reply..."
          className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y"
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
          {error ? (
            <span className="text-danger font-medium">{error}</span>
          ) : (
            <span />
          )}
          <span className="font-mono">{body.length} / 2000</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !body.trim()}
          isLoading={isLoading}
        >
          Post Reply
        </Button>
      </div>
    </form>
  );
}
