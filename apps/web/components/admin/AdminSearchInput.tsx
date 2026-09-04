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
  placeholder = 'Tìm kiếm...',
  containerClassName = '',
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
      className={`relative flex w-full items-center sm:w-80 lg:w-96 ${containerClassName}`}
      role="search"
    >
      {/* Search or Loading Icon */}
      <div
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors"
        aria-hidden="true"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" data-testid="search-spinner" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground" data-testid="search-icon" />
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
        aria-label={props['aria-label'] || placeholder}
        className={`h-10 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />

      {/* Clear Button */}
      {Boolean(currentInputValue) && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Xóa tìm kiếm"
          title="Xóa tìm kiếm (Esc)"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
