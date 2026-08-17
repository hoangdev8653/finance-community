import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query/keys';
import { featureFlagsService } from './feature-flags-service';
import type { FeatureFlagMap } from '../../types/feature-flags';

const DEFAULT_REFETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface UseFeatureFlagsOptions {
  /** Polling interval in ms for background flag synchronization (default: 5 minutes) */
  refetchInterval?: number;
}

/**
 * TanStack Query hook for fetching the public feature flag map.
 *
 * - `staleTime`: 5 minutes (flags rarely change mid-session)
 * - `gcTime`: 10 minutes (retain cache slightly beyond stale window)
 * - `refetchInterval`: 5 minutes (background polling for near-real-time sync)
 * - `refetchOnWindowFocus`: true (catch admin changes when user returns)
 * - `retry`: 2 (guard transient failures on a highly-available public endpoint)
 */
export function useFeatureFlags(options?: UseFeatureFlagsOptions) {
  return useQuery<FeatureFlagMap>({
    queryKey: queryKeys.featureFlags.public,
    queryFn: () => featureFlagsService.getPublicFlags(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: options?.refetchInterval ?? DEFAULT_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
