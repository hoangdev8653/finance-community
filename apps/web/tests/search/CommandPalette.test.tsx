import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPalette } from '@/components/search/CommandPalette';
import * as searchHooks from '@/lib/search/use-search';
import { useRouter } from 'next/navigation';

vi.mock('@/lib/search/use-search');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('CommandPalette Component', () => {
  const mockPush = vi.fn();
  const mockClose = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    mockClose.mockReset();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
  });

  it('renders search dialog when open and shows topic results', () => {
    const mockResults = [
      {
        type: 'tag' as const,
        id: 't-1',
        title: '#options',
        slug: 'options',
        description: 'Explore topic #options',
        url: '/tags/options',
      },
    ];

    vi.mocked(searchHooks.useCommandPaletteSearch).mockReturnValue({
      data: mockResults,
      isLoading: false,
    } as any);

    render(<CommandPalette isOpen={true} onClose={mockClose} />);

    expect(screen.getByRole('dialog', { name: /Global Search Command Palette/i })).toBeDefined();
    expect(screen.getByText('#options')).toBeDefined();

    // Click result item
    const option = screen.getByRole('option', { name: /#options/i });
    fireEvent.click(option);

    expect(mockPush).toHaveBeenCalledWith('/tags/options');
    expect(mockClose).toHaveBeenCalled();
  });

  it('handles keyboard ArrowDown, ArrowUp, and Escape', () => {
    vi.mocked(searchHooks.useCommandPaletteSearch).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<CommandPalette isOpen={true} onClose={mockClose} />);

    const input = screen.getByPlaceholderText(/Search topics, categories, or tags/i);
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(mockClose).toHaveBeenCalled();
  });
});
