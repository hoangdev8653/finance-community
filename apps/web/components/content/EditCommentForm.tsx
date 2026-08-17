'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface EditCommentFormProps {
  initialBody: string;
  onSave: (body: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditCommentForm({
  initialBody,
  onSave,
  onCancel,
  isLoading = false,
}: EditCommentFormProps) {
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError('Comment body cannot be empty.');
      return;
    }
    if (trimmed.length > 2000) {
      setError('Comment exceeds the 2000 character limit.');
      return;
    }

    try {
      setError(null);
      await onSave(trimmed);
    } catch {
      setError('Failed to update comment. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2">
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={3}
          disabled={isLoading}
          aria-label="Edit comment"
          placeholder="Edit your analytical perspective..."
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
          Save Changes
        </Button>
      </div>
    </form>
  );
}
