'use client';

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useFeatureFlags } from './use-feature-flags';
import type { FeatureFlagContextValue, FeatureFlagMap } from '../../types/feature-flags';

/**
 * Default context value used when the provider is not mounted.
 * All flags default to disabled; isLoading is false so consumers don't wait forever.
 */
const defaultContextValue: FeatureFlagContextValue = {
  flags: {},
  isLoading: false,
  isError: false,
  getFlag: (_key: string, defaultValue: boolean = false) => defaultValue,
  refetch: () => Promise.resolve(),
};

const FeatureFlagContext = createContext<FeatureFlagContextValue>(defaultContextValue);

/**
 * FeatureFlagProvider
 *
 * Fetches the public feature flag map via TanStack Query and provides it
 * to the entire component tree via React Context.
 *
 * Must be placed inside QueryProvider (for TanStack Query access).
 * Placed inside AuthProvider in the provider tree as specified in F16.0.
 */
export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError, refetch } = useFeatureFlags();

  // Safely default to empty map when data is undefined (initial load or error)
  const flags: FeatureFlagMap = data ?? {};

  const getFlag = useCallback(
    (key: string, defaultValue: boolean = false): boolean => {
      if (key in flags) {
        return flags[key];
      }
      return defaultValue;
    },
    [flags]
  );

  const value = useMemo<FeatureFlagContextValue>(
    () => ({
      flags,
      isLoading,
      isError,
      getFlag,
      refetch,
    }),
    [flags, isLoading, isError, getFlag, refetch]
  );

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * useFeatureFlag
 *
 * Returns the boolean value of a specific feature flag.
 * If the flag is unknown or not yet loaded, returns `defaultValue` (default: false).
 *
 * @param key - The feature flag key to check
 * @param defaultValue - Fallback value when the flag is unknown (default: false)
 */
export function useFeatureFlag(key: string, defaultValue: boolean = false): boolean {
  const ctx = useContext(FeatureFlagContext);
  return ctx.getFlag(key, defaultValue);
}

/**
 * useFeatureFlagContext
 *
 * Returns the full feature flag context value for advanced usage.
 * Includes loading state, error state, full flag map, and refetch function.
 */
export function useFeatureFlagContext(): FeatureFlagContextValue {
  return useContext(FeatureFlagContext);
}
