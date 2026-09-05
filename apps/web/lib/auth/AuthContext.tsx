'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { tokenStore } from './token-store';
import { authService } from './auth-service';
import {
  User,
  LoginDto,
  RegisterDto,
  AuthContextType,
} from '../../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const logout = useCallback(() => {
    tokenStore.clearToken();
    setUser(null);
  }, []);

  // Listen for unauthorized 401 events emitted by Axios client on authenticated requests
  useEffect(() => {
    const unsubscribe = tokenStore.subscribeUnauthorized(() => {
      setUser(null);
    });

    // Check for existing persistent session on mount
    const token = tokenStore.getToken();
    if (token) {
      setIsLoading(true);
      authService
        .getCurrentUserMe()
        .then((meData) => {
          setUser({
            id: meData.id,
            email: meData.email,
            username: meData.profile?.username || 'user',
            displayName: meData.profile?.displayName || meData.email,
            avatarUrl: meData.profile?.avatarUrl,
            roles: meData.roles || ['MEMBER'],
            status: meData.status || 'ACTIVE',
          });
        })
        .catch(() => {
          tokenStore.clearToken();
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const syncUserProfile = async (fallbackUser: { id: string; email: string; username: string; status: any }): Promise<void> => {
    try {
      const meData = await authService.getCurrentUserMe();
      setUser({
        id: meData.id,
        email: meData.email,
        username: meData.profile?.username || fallbackUser.username,
        displayName: meData.profile?.displayName || fallbackUser.username,
        avatarUrl: meData.profile?.avatarUrl,
        roles: meData.roles || ['MEMBER'],
        status: meData.status || fallbackUser.status || 'ACTIVE',
      });
    } catch {
      // If /users/me fails, populate user from auth response fallback
      setUser({
        id: fallbackUser.id,
        email: fallbackUser.email,
        username: fallbackUser.username,
        displayName: fallbackUser.username,
        roles: ['MEMBER'],
        status: fallbackUser.status || 'ACTIVE',
      });
    }
  };

  const login = async (dto: LoginDto): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.login(dto);
      tokenStore.setToken(response.accessToken);
      tokenStore.setRefreshToken(response.refreshToken);
      await syncUserProfile(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (dto: RegisterDto): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.register(dto);
      tokenStore.setToken(response.accessToken);
      tokenStore.setRefreshToken(response.refreshToken);
      await syncUserProfile(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.loginWithGoogle(idToken);
      tokenStore.setToken(response.accessToken);
      tokenStore.setRefreshToken(response.refreshToken);
      await syncUserProfile(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFacebook = async (accessToken: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.loginWithFacebook(accessToken);
      tokenStore.setToken(response.accessToken);
      tokenStore.setRefreshToken(response.refreshToken);
      await syncUserProfile(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        loginWithFacebook,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
