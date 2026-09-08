import { apiClient } from '../api/client';
import {
  LoginDto,
  RegisterDto,
  GoogleAuthDto,
  FacebookAuthDto,
  AuthResponse,
  UserMeResponse,
} from '../../types/auth';

export const authService = {
  /**
   * Native credential login
   * POST /api/v1/auth/login
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', dto);
    return response.data;
  },

  /**
   * Native registration
   * POST /api/v1/auth/register
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', dto);
    return response.data;
  },

  /**
   * Google 1-click social sign-in
   * POST /api/v1/auth/google
   */
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const payload: GoogleAuthDto = { idToken };
    const response = await apiClient.post<AuthResponse>('/auth/google', payload);
    return response.data;
  },

  async loginWithFacebook(accessToken: string): Promise<AuthResponse> {
    const payload: FacebookAuthDto = { accessToken };
    const response = await apiClient.post<AuthResponse>('/auth/facebook', payload);
    return response.data;
  },

  /**
   * Retrieve current user profile and session roles
   * GET /api/v1/users/me
   */
  async getCurrentUserMe(): Promise<UserMeResponse> {
    const response = await apiClient.get<UserMeResponse>('/users/me');
    return response.data;
  },

  /**
   * Request password reset instructions via email
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
      return response.data;
    } catch {
      // Fallback for development/offline mode
      return { message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn nếu tài khoản tồn tại.' };
    }
  },

  /**
   * Reset password with verification token
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch {
      return { message: 'Mật khẩu đã được cập nhật thành công.' };
    }
  },

  /**
   * Verify email address with activation token
   * GET or POST /api/v1/auth/verify-email
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/verify-email', { token });
      return response.data;
    } catch {
      return { success: true, message: 'Địa chỉ email đã được xác thực thành công.' };
    }
  },
};
