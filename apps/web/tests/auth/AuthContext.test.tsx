import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import { authService } from '@/lib/auth/auth-service';
import { tokenStore } from '@/lib/auth/token-store';

describe('AuthContext', () => {
  beforeEach(() => {
    tokenStore.clearToken();
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('initializes in unauthenticated state without exposing accessToken in context', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    // Ensure accessToken is NOT part of public context API
    expect((result.current as any).accessToken).toBeUndefined();
  });

  it('login() sets token in tokenStore, synchronizes user profile, and updates auth state', async () => {
    vi.spyOn(authService, 'login').mockResolvedValueOnce({
      accessToken: 'login_jwt_token',
      tokenType: 'Bearer',
      user: {
        id: 'u-1',
        email: 'user@test.com',
        username: 'testuser',
        status: 'ACTIVE',
      },
    });

    vi.spyOn(authService, 'getCurrentUserMe').mockResolvedValueOnce({
      id: 'u-1',
      email: 'user@test.com',
      status: 'ACTIVE',
      roles: ['MEMBER'],
      profile: {
        displayName: 'Test User',
        username: 'testuser',
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: 'user@test.com', password: 'password123' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('user@test.com');
    expect(result.current.user?.displayName).toBe('Test User');
    expect(tokenStore.getToken()).toBe('login_jwt_token');
  });

  it('logout() clears tokenStore and resets user state', async () => {
    tokenStore.setToken('existing_token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(tokenStore.getToken()).toBeNull();
  });

  it('clears user session when tokenStore emits unauthorized notification', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      tokenStore.notifyUnauthorized();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
