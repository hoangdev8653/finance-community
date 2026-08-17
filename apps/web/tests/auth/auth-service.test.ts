import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/lib/auth/auth-service';
import { apiClient } from '@/lib/api/client';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('login() calls POST /auth/login with credentials and returns auth payload', async () => {
    const mockAuthResponse = {
      accessToken: 'jwt_test_token',
      tokenType: 'Bearer',
      user: {
        id: 'user-uuid-123',
        email: 'analyst@finance.com',
        username: 'analyst',
        status: 'ACTIVE' as const,
      },
    };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockAuthResponse } as any);

    const result = await authService.login({
      email: 'analyst@finance.com',
      password: 'password123',
    });

    expect(postSpy).toHaveBeenCalledWith('/auth/login', {
      email: 'analyst@finance.com',
      password: 'password123',
    });
    expect(result).toEqual(mockAuthResponse);
  });

  it('register() calls POST /auth/register with exact DTO fields', async () => {
    const mockAuthResponse = {
      accessToken: 'jwt_test_token_reg',
      tokenType: 'Bearer',
      user: {
        id: 'user-uuid-456',
        email: 'newuser@finance.com',
        username: 'newuser',
        status: 'ACTIVE' as const,
      },
    };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockAuthResponse } as any);

    const result = await authService.register({
      email: 'newuser@finance.com',
      username: 'newuser',
      password: 'password123',
    });

    expect(postSpy).toHaveBeenCalledWith('/auth/register', {
      email: 'newuser@finance.com',
      username: 'newuser',
      password: 'password123',
    });
    expect(result).toEqual(mockAuthResponse);
  });

  it('loginWithGoogle() sends { idToken } to POST /auth/google', async () => {
    const mockAuthResponse = {
      accessToken: 'jwt_google_token',
      tokenType: 'Bearer',
      user: {
        id: 'google-user-uuid',
        email: 'google@gmail.com',
        username: 'googleuser',
        status: 'ACTIVE' as const,
        provider: 'GOOGLE',
      },
    };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockAuthResponse } as any);

    const result = await authService.loginWithGoogle('mock_google_id_token_123');

    expect(postSpy).toHaveBeenCalledWith('/auth/google', {
      idToken: 'mock_google_id_token_123',
    });
    expect(result).toEqual(mockAuthResponse);
  });

  it('getCurrentUserMe() calls GET /users/me', async () => {
    const mockMeResponse = {
      id: 'user-uuid-123',
      email: 'analyst@finance.com',
      status: 'ACTIVE' as const,
      roles: ['MEMBER', 'ADMIN'],
      profile: {
        username: 'analyst',
        displayName: 'Senior Analyst',
      },
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockMeResponse } as any);

    const result = await authService.getCurrentUserMe();

    expect(getSpy).toHaveBeenCalledWith('/users/me');
    expect(result).toEqual(mockMeResponse);
  });
});
