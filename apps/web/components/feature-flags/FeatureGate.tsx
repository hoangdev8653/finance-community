'use client';

import React from 'react';
import { useFeatureFlag } from '@/lib/feature-flags/FeatureFlagContext';
import type { FeatureGateProps } from '@/types/feature-flags';

/**
 * FeatureGate
 *
 * Declarative component for conditional rendering based on a feature flag.
 *
 * When the flag is enabled, renders `children`.
 * When the flag is disabled (or unknown), renders `fallback` (defaults to null).
 *
 * @example
 * ```tsx
 * <FeatureGate flag="enable_rich_editor" fallback={<BasicEditor />}>
 *   <RichEditor />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  flag,
  defaultValue = false,
  fallback = null,
  children,
}: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag, defaultValue);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
