import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TagInput } from '@/components/studio/TagInput';

vi.mock('@/lib/posts/posts-service', () => ({
  postsService: {
    getTags: vi.fn().mockResolvedValue([]),
  },
}));

describe('TagInput Component', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders existing tags, allows adding new tags and removing tags', () => {
    const onChange = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <TagInput tags={['macro', 'crypto']} onChange={onChange} />
      </QueryClientProvider>
    );

    expect(screen.getByText('#macro')).toBeDefined();
    expect(screen.getByText('#crypto')).toBeDefined();

    // Add tag via Enter
    const input = screen.getByLabelText(/Tags/i);
    fireEvent.change(input, { target: { value: 'rates' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['macro', 'crypto', 'rates']);

    // Remove tag
    const removeMacroBtn = screen.getByRole('button', { name: /Remove tag macro/i });
    fireEvent.click(removeMacroBtn);

    expect(onChange).toHaveBeenCalledWith(['crypto']);
  });
});
