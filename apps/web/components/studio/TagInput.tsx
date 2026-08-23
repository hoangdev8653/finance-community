'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsService } from '@/lib/posts/posts-service';
import { Badge } from '@/components/ui/Badge';
import { X, Tag as TagIcon, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [inputVal, setInputVal] = useState('');

  const { data: tagSuggestions = [] } = useQuery({
    queryKey: ['tags', 'list', { search: inputVal.trim() }],
    queryFn: () => postsService.getTags(inputVal.trim(), 5),
    enabled: inputVal.trim().length > 1,
    staleTime: 60 * 1000,
  });

  const addTag = (tagName: string) => {
    const clean = tagName.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      onChange([...tags, clean]);
    }
    setInputVal('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    }
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="post-tags-input"
        className="block text-xs font-medium text-foreground"
      >
        Tags
      </label>

      {/* Selected Tags Chips */}
      <div className="flex flex-wrap gap-1.5 min-h-9 p-2 rounded-md border border-input bg-background items-center">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="gap-1 font-mono text-xs py-0.5 px-2 bg-muted/50"
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
              className="hover:text-danger rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <div className="flex-1 min-w-[120px] flex items-center">
          <input
            id="post-tags-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? 'Type tag and press Enter...' : ''}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
          />
        </div>
      </div>

      {/* Tag Suggestions */}
      {tagSuggestions.length > 0 && inputVal.trim().length > 1 && (
        <div className="flex flex-wrap gap-1 pt-1">
          <span className="text-xs text-muted-foreground self-center mr-1">
            Suggestions:
          </span>
          {tagSuggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => addTag(suggestion.name)}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary bg-muted px-1.5 py-0.5 rounded transition-colors"
            >
              <Plus className="h-2.5 w-2.5" />
              <span>#{suggestion.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
