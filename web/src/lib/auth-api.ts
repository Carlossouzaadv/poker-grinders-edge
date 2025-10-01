import { apiClient } from './api-client';

/**
 * Registration data interface
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Login data interface
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Authentication API functions
 * All functions communicate with the NestJS backend
 */
export const authApi = {
  /**
   * Register a new user
   * @returns { access_token, refresh_token, user }
   */
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login with email and password
   * @returns { access_token, refresh_token, user }
   */
  login: async (data: LoginData) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  /**
   * Logout and invalidate refresh token
   */
  logout: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    return response.data;
  },

  /**
   * Get current user profile
   * Requires valid access token
   */
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};