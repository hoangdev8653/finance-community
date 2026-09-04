import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AdminSearchInput } from '@/components/admin/AdminSearchInput';

const mockReplace = vi.fn();
const mockRouter = { replace: mockReplace, push: vi.fn() };
const mockSearchParams = new URLSearchParams('');

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/admin/items',
  useSearchParams: () => mockSearchParams,
}));

describe('AdminSearchInput Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockReplace.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders input with default placeholder and search icon', () => {
    render(<AdminSearchInput placeholder="Tìm kiếm mục..." />);

    const input = screen.getByPlaceholderText('Tìm kiếm mục...');
    expect(input).toBeDefined();
    expect(screen.getByTestId('search-icon')).toBeDefined();
    expect(screen.queryByLabelText('Xóa tìm kiếm')).toBeNull();
  });

  it('renders loading spinner when isLoading is true', () => {
    render(<AdminSearchInput isLoading={true} />);

    expect(screen.getByTestId('search-spinner')).toBeDefined();
    expect(screen.queryByTestId('search-icon')).toBeNull();
  });

  it('calls onValueChange immediately on typing and onDebouncedChange after debounceMs', () => {
    const handleValueChange = vi.fn();
    const handleDebouncedChange = vi.fn();

    render(
      <AdminSearchInput
        onValueChange={handleValueChange}
        onDebouncedChange={handleDebouncedChange}
        debounceMs={300}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(handleValueChange).toHaveBeenCalledWith('test query');
    expect(handleDebouncedChange).not.toHaveBeenCalledWith('test query');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(handleDebouncedChange).toHaveBeenCalledWith('test query');
  });

  it('clears input and invokes callbacks when clear button is clicked', () => {
    const handleValueChange = vi.fn();

    render(
      <AdminSearchInput
        value="something"
        onValueChange={handleValueChange}
      />
    );

    const clearButton = screen.getByLabelText('Xóa tìm kiếm');
    expect(clearButton).toBeDefined();

    fireEvent.click(clearButton);
    expect(handleValueChange).toHaveBeenCalledWith('');
  });

  it('clears input when Escape key is pressed', () => {
    const handleValueChange = vi.fn();

    render(
      <AdminSearchInput
        value="searching"
        onValueChange={handleValueChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(handleValueChange).toHaveBeenCalledWith('');
  });

  it('synchronizes with URL when syncWithUrl is enabled', () => {
    render(
      <AdminSearchInput
        syncWithUrl={true}
        queryParamKey="search"
        debounceMs={300}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'keyword' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockReplace).toHaveBeenCalledWith('/admin/items?search=keyword', { scroll: false });
  });
});
