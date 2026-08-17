import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeatureFlags } from '@/lib/feature-flags/use-feature-flags';
import * as featureFlagsServiceModule from '@/lib/feature-flags/feature-flags-service';

vi.mock('@/lib/feature-flags/feature-flags-service');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('useFeatureFlags Hook', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns flag data on successful fetch', async () => {
    const mockFlags = { enable_charts: true, beta_studio: false };
    vi.mocked(featureFlagsServiceModule.featureFlagsService.getPublicFlags)
      .mockResolvedValueOnce(mockFlags);

    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockFlags);
  });

  it('returns loading state initially', () => {
    vi.mocked(featureFlagsServiceModule.featureFlagsService.getPublicFlags)
      .mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns error state on failure', async () => {
    vi.mocked(featureFlagsServiceModule.featureFlagsService.getPublicFlags)
      .mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 }
    );
  });

  it('uses correct query key featureFlags.public', async () => {
    const mockFlags = { test_flag: true };
    vi.mocked(featureFlagsServiceModule.featureFlagsService.getPublicFlags)
      .mockResolvedValueOnce(mockFlags);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useFeatureFlags(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const cachedData = queryClient.getQueryData(['featureFlags', 'public']);
    expect(cachedData).toEqual(mockFlags);
  });
});
