import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeatureFlagsView } from '@/components/admin/FeatureFlagsView';
import * as adminHooks from '@/lib/admin/use-admin';

vi.mock('@/lib/admin/use-admin');

describe('FeatureFlagsView Component', () => {
  const mockToggle = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockToggle.mockReset();

    vi.mocked(adminHooks.useToggleFeatureFlag).mockReturnValue({
      mutateAsync: mockToggle,
      isPending: false,
    } as any);
  });

  it('renders flags list and toggles flag state via accessible switch', async () => {
    const mockFlags = [
      {
        id: '1',
        key: 'interactive_charts',
        isEnabled: false,
        description: 'Interactive financial chart rendering',
        updatedAt: '2026-08-16T00:00:00Z',
      },
    ];

    vi.mocked(adminHooks.useAdminFeatureFlags).mockReturnValue({
      data: mockFlags,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    mockToggle.mockResolvedValueOnce({ ...mockFlags[0], isEnabled: true });

    render(<FeatureFlagsView />);

    expect(screen.getByText('interactive_charts')).toBeDefined();
    expect(screen.getByText('Interactive financial chart rendering')).toBeDefined();
    expect(screen.getByText('Disabled')).toBeDefined();

    const switchBtn = screen.getByRole('switch', { name: /Toggle feature flag interactive_charts/i });
    expect(switchBtn.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(switchBtn);

    await waitFor(() => {
      expect(mockToggle).toHaveBeenCalledWith({
        key: 'interactive_charts',
        dto: { isEnabled: true, description: 'Interactive financial chart rendering' },
      });
    });
  });
});
