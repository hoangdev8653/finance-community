import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from '../auth/token-store';

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  code?: string;
  requestId?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Reads directly from private runtime tokenStore
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalizes NestJS error payloads and triggers unauthorized notifications
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const normalizedError: ApiErrorResponse = {
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error || error.name || 'Network Error',
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      requestId: error.response?.data?.requestId || (error.response?.headers?.['x-request-id'] as string),
    };

    // Authenticated API request returned 401 Unauthorized (exclude /auth/ credentials errors)
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register') ||
      error.config?.url?.includes('/auth/google');

    if (error.response?.status === 401 && !isAuthEndpoint && error.config && !(error.config as any)._retry) {
      const refreshToken = tokenStore.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          tokenStore.setToken(response.data.accessToken);
          tokenStore.setRefreshToken(response.data.refreshToken);
          (error.config as any)._retry = true;
          return apiClient.request(error.config);
        } catch { tokenStore.notifyUnauthorized(); }
      } else tokenStore.notifyUnauthorized();
    }

    return Promise.reject(normalizedError);
  }
);
