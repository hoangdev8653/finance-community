import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureGate } from '@/components/feature-flags/FeatureGate';
import * as FeatureFlagContextModule from '@/lib/feature-flags/FeatureFlagContext';

vi.mock('@/lib/feature-flags/FeatureFlagContext');

describe('FeatureGate Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when flag is enabled', () => {
    vi.mocked(FeatureFlagContextModule.useFeatureFlag).mockReturnValue(true);

    render(
      <FeatureGate flag="enable_charts">
        <span data-testid="gated-content">Chart Module</span>
      </FeatureGate>
    );

    expect(screen.getByTestId('gated-content')).toBeDefined();
    expect(screen.getByTestId('gated-content').textContent).toBe('Chart Module');
  });

  it('renders nothing when flag is disabled and no fallback', () => {
    vi.mocked(FeatureFlagContextModule.useFeatureFlag).mockReturnValue(false);

    const { container } = render(
      <FeatureGate flag="disabled_feature">
        <span data-testid="gated-content">Hidden Content</span>
      </FeatureGate>
    );

    expect(screen.queryByTestId('gated-content')).toBeNull();
    expect(container.innerHTML).toBe('');
  });

  it('renders fallback when flag is disabled', () => {
    vi.mocked(FeatureFlagContextModule.useFeatureFlag).mockReturnValue(false);

    render(
      <FeatureGate
        flag="disabled_feature"
        fallback={<span data-testid="fallback-content">Basic Editor</span>}
      >
        <span data-testid="gated-content">Rich Editor</span>
      </FeatureGate>
    );

    expect(screen.queryByTestId('gated-content')).toBeNull();
    expect(screen.getByTestId('fallback-content')).toBeDefined();
    expect(screen.getByTestId('fallback-content').textContent).toBe('Basic Editor');
  });

  it('uses defaultValue when flag is unknown', () => {
    // useFeatureFlag is called with (flag, defaultValue)
    // When defaultValue=true and the flag is unknown, it should return true
    vi.mocked(FeatureFlagContextModule.useFeatureFlag).mockImplementation(
      (_key: string, defaultValue: boolean = false) => defaultValue
    );

    render(
      <FeatureGate flag="unknown_flag" defaultValue={true}>
        <span data-testid="gated-content">Opt-in Feature</span>
      </FeatureGate>
    );

    expect(screen.getByTestId('gated-content')).toBeDefined();
    expect(screen.getByTestId('gated-content').textContent).toBe('Opt-in Feature');
  });
});
