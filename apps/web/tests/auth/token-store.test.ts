import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tokenStore } from '@/lib/auth/token-store';

describe('Token Store (In-Memory)', () => {
  beforeEach(() => {
    tokenStore.clearToken();
  });

  it('stores and retrieves access token correctly', () => {
    expect(tokenStore.getToken()).toBeNull();
    tokenStore.setToken('test_jwt_access_token_123');
    expect(tokenStore.getToken()).toBe('test_jwt_access_token_123');
  });

  it('clears token on clearToken()', () => {
    tokenStore.setToken('test_jwt_access_token_123');
    tokenStore.clearToken();
    expect(tokenStore.getToken()).toBeNull();
  });

  it('subscribes and notifies unauthorized listeners', () => {
    const listener = vi.fn();
    const unsubscribe = tokenStore.subscribeUnauthorized(listener);

    tokenStore.setToken('test_jwt_access_token_123');
    tokenStore.notifyUnauthorized();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(tokenStore.getToken()).toBeNull(); // notifyUnauthorized wipes the token

    unsubscribe();
    tokenStore.notifyUnauthorized();
    expect(listener).toHaveBeenCalledTimes(1); // listener removed
  });
});
