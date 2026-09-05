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
};
