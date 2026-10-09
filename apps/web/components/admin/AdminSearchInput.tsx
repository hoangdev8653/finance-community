'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/lib/hooks/use-debounce';

export interface AdminSearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  /**
   * Current controlled input value.
   */
  value?: string;
  /**
   * Default uncontrolled input value.
   */
  defaultValue?: string;
  /**
   * Immediate callback triggered on every keystroke (for controlled state).
   */
  onValueChange?: (value: string) => void;
  /**
   * Debounced callback triggered after user stops typing (ideal for API queries).
   */
  onDebouncedChange?: (debouncedValue: string) => void;
  /**
   * Debounce delay in milliseconds (default: 350ms).
   */
  debounceMs?: number;
  /**
   * Whether an async query is currently loading.
   */
  isLoading?: boolean;
  /**
   * Whether to synchronize the search term with URL search params.
   */
  syncWithUrl?: boolean;
  /**
   * URL query parameter key to synchronize with (default: 'q').
   */
  queryParamKey?: string;
  /**
   * Custom CSS classes for the outer wrapper container.
   */
  containerClassName?: string;
  /** Let the search control fill the available row instead of using its default width. */
  fullWidth?: boolean;
}

export function AdminSearchInput({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  onDebouncedChange,
  debounceMs = 350,
  isLoading = false,
  syncWithUrl = false,
  queryParamKey = 'q',
  placeholder = '',
  containerClassName = '',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: AdminSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Internal state for uncontrolled or hybridized mode
  const initialUrlValue = syncWithUrl && searchParams ? searchParams.get(queryParamKey) ?? '' : '';
  const [internalValue, setInternalValue] = useState<string>(
    controlledValue !== undefined ? controlledValue : initialUrlValue || defaultValue
  );

  const isControlled = controlledValue !== undefined;
  const currentInputValue = isControlled ? controlledValue : internalValue;

  // Track debounced value
  const debouncedValue = useDebounce(currentInputValue, debounceMs);

  // Sync controlled value changes into internal state if controlled
  useEffect(() => {
    if (isControlled) {
      setInternalValue(controlledValue);
    }
  }, [isControlled, controlledValue]);

  const searchParamsString = searchParams ? searchParams.toString() : '';

  // Trigger debounced callback and optional URL sync
  useEffect(() => {
    if (onDebouncedChange) {
      onDebouncedChange(debouncedValue);
    }

    if (syncWithUrl && pathname) {
      startTransition(() => {
        const params = new URLSearchParams(searchParamsString);
        const trimmed = debouncedValue.trim();
        if (trimmed) {
          params.set(queryParamKey, trimmed);
          // Always reset page to 1 on search change if pagination param exists
          if (params.has('page')) {
            params.set('page', '1');
          }
        } else {
          params.delete(queryParamKey);
        }

        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newUrl, { scroll: false });
      });
    }
  }, [debouncedValue, onDebouncedChange, syncWithUrl, pathname, queryParamKey, router, searchParamsString]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    if (!isControlled) {
      setInternalValue(nextVal);
    }
    onValueChange?.(nextVal);
  };

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }
    onValueChange?.('');
  }, [isControlled, onValueChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
    }
    props.onKeyDown?.(e);
  };

  return (
    <div
      className={`relative flex w-full min-w-0 items-center sm:w-full sm:max-w-[680px] ${containerClassName}`}
      role="search"
    >
      {/* Search or Loading Icon */}
      <div
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 transition-colors dark:text-slate-300"
        aria-hidden="true"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-emerald-700" data-testid="search-spinner" />
        ) : (
          <Search className="h-4 w-4 text-slate-600 dark:text-slate-300" data-testid="search-icon" />
        )}
      </div>

      {/* Main Search Input */}
      <input
        type="text"
        disabled={disabled}
        value={currentInputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={props['aria-label'] || placeholder || 'Tìm kiếm'}
        className={`h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white pl-10 pr-10 text-base font-medium text-slate-900 shadow-sm transition-[border-color,background-color,box-shadow] duration-200 hover:border-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500 dark:focus:border-emerald-500 dark:focus:bg-slate-900 ${className}`}
        {...props}
      />

      {/* Clear Button */}
      {Boolean(currentInputValue) && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          aria-label="Xóa tìm kiếm"
          title="Xóa tìm kiếm (Esc)"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
