import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  FeatureFlagProvider,
  useFeatureFlag,
  useFeatureFlagContext,
} from '@/lib/feature-flags/FeatureFlagContext';
import * as useFeatureFlagsModule from '@/lib/feature-flags/use-feature-flags';

vi.mock('@/lib/feature-flags/use-feature-flags');

/** Helper: renders a consumer component inside the provider tree */
function renderWithProvider(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(FeatureFlagProvider, null, ui)
    )
  );
}

/** Test consumer that displays the result of useFeatureFlag */
function FlagConsumer({ flagKey, defaultValue }: { flagKey: string; defaultValue?: boolean }) {
  const value = useFeatureFlag(flagKey, defaultValue);
  return React.createElement('span', { 'data-testid': 'flag-value' }, String(value));
}

/** Test consumer that displays context loading and error states */
function ContextConsumer() {
  const ctx = useFeatureFlagContext();
  return React.createElement(
    'div',
    null,
    React.createElement('span', { 'data-testid': 'is-loading' }, String(ctx.isLoading)),
    React.createElement('span', { 'data-testid': 'is-error' }, String(ctx.isError)),
    React.createElement('span', { 'data-testid': 'flag-count' }, String(Object.keys(ctx.flags).length))
  );
}

describe('FeatureFlagContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('useFeatureFlag returns correct value for known enabled flag', () => {
    vi.mocked(useFeatureFlagsModule.useFeatureFlags).mockReturnValue({
      data: { enable_charts: true, beta_studio: false },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithProvider(
      React.createElement(FlagConsumer, { flagKey: 'enable_charts' })
    );

    expect(screen.getByTestId('flag-value').textContent).toBe('true');
  });

  it('useFeatureFlag returns default value for unknown flag', () => {
    vi.mocked(useFeatureFlagsModule.useFeatureFlags).mockReturnValue({
      data: { enable_charts: true },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithProvider(
      React.createElement(FlagConsumer, { flagKey: 'nonexistent_flag', defaultValue: true })
    );

    expect(screen.getByTestId('flag-value').textContent).toBe('true');
  });

  it('useFeatureFlag returns false when flag is disabled', () => {
    vi.mocked(useFeatureFlagsModule.useFeatureFlags).mockReturnValue({
      data: { beta_studio: false },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithProvider(
      React.createElement(FlagConsumer, { flagKey: 'beta_studio' })
    );

    expect(screen.getByTestId('flag-value').textContent).toBe('false');
  });

  it('useFeatureFlag defaults to false when no default value provided and flag is unknown', () => {
    vi.mocked(useFeatureFlagsModule.useFeatureFlags).mockReturnValue({
      data: {},
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithProvider(
      React.createElement(FlagConsumer, { flagKey: 'unknown_flag' })
    );

    expect(screen.getByTestId('flag-value').textContent).toBe('false');
  });

  it('useFeatureFlagContext provides loading and error states', () => {
    vi.mocked(useFeatureFlagsModule.useFeatureFlags).mockReturnValue({
      data: { flag_a: true },
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);

    renderWithProvider(
      React.createElement(ContextConsumer)
    );

    expect(screen.getByTestId('is-loading').textContent).toBe('false');
    expect(screen.getByTestId('is-error').textContent).toBe('true');
    expect(screen.getByTestId('flag-count').textContent).toBe('1');
  });
});
