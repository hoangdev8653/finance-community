import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '@/components/search/SearchBar';
import * as searchHooks from '@/lib/search/use-search';

vi.mock('@/lib/search/use-search');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('SearchBar Component', () => {
  it('renders trigger button and opens command palette dialog on click', () => {
    vi.mocked(searchHooks.useCommandPaletteSearch).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<SearchBar />);

    const triggerBtn = screen.getByRole('button', { name: /Tìm kiếm|Search/i });
    expect(triggerBtn).toBeDefined();

    fireEvent.click(triggerBtn);

    expect(screen.getByRole('dialog')).toBeDefined();
  });
});
