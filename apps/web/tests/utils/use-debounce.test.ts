import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '@/lib/hooks/use-debounce';

describe('useDebounce hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('should debounce value change until timer elapses', () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    // Update props
    rerender({ val: 'updated', delay: 300 });

    // Value should still be initial before timer finishes
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    // Advance remaining time
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset timer if value changes rapidly before timeout', () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: 'first', delay: 300 } }
    );

    rerender({ val: 'second', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ val: 'third', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // Total 400ms passed, but 'third' was set 200ms ago, so still 'first'
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    // Now 300ms passed since 'third'
    expect(result.current).toBe('third');
  });
});

describe('useDebouncedCallback hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce multiple rapid calls into one single call', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current('a');
      result.current('b');
      result.current('c');
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('c');
  });
});
