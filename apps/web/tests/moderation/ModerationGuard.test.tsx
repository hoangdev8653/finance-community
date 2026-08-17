import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModerationGuard } from '@/components/moderation/ModerationGuard';
import * as authContext from '@/lib/auth/AuthContext';

vi.mock('@/lib/auth/AuthContext');

describe('ModerationGuard Component', () => {
  it('renders children when user has MODERATOR role', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u-1', roles: ['MODERATOR'] },
    } as any);

    render(
      <ModerationGuard>
        <div>Protected Moderation Console</div>
      </ModerationGuard>
    );

    expect(screen.getByText('Protected Moderation Console')).toBeDefined();
  });

  it('renders Access Restricted when user has only MEMBER role', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u-2', roles: ['MEMBER'] },
    } as any);

    render(
      <ModerationGuard>
        <div>Protected Moderation Console</div>
      </ModerationGuard>
    );

    expect(screen.getByText('Access Restricted')).toBeDefined();
    expect(screen.queryByText('Protected Moderation Console')).toBeNull();
  });

  it('renders loading state when auth is loading', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    } as any);

    render(
      <ModerationGuard>
        <div>Protected Moderation Console</div>
      </ModerationGuard>
    );

    expect(screen.getByText(/Authenticating moderator credentials/i)).toBeDefined();
  });
});
