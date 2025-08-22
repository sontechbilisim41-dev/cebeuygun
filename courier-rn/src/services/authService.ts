import { apiClient } from './apiClient';
import { mockAuthService } from './mockData/mockAuthService';
import { LoginForm, RegisterForm, User, Courier } from '@/types';
import { store } from '@/store';

class AuthService {
  private get useMockData(): boolean {
    return store.getState().settings.useMockData;
  }

  async login(credentials: LoginForm): Promise<{
    user: User;
    courier: Courier;
    accessToken: string;
    refreshToken: string;
  }> {
    if (this.useMockData) {
      return mockAuthService.login(credentials);
    }

    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterForm): Promise<{
    user: User;
    courier: Courier;
    accessToken: string;
    refreshToken: string;
  }> {
    if (this.useMockData) {
      return mockAuthService.register(userData);
    }

    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (this.useMockData) {
      return mockAuthService.refreshToken(refreshToken);
    }

    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async verifyToken(accessToken: string): Promise<{
    user: User;
    courier: Courier;
  }> {
    if (this.useMockData) {
      return mockAuthService.verifyToken(accessToken);
    }

    const response = await apiClient.get('/auth/verify', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  async logout(refreshToken: string): Promise<void> {
    if (this.useMockData) {
      return mockAuthService.logout(refreshToken);
    }

    await apiClient.post('/auth/logout', { refreshToken });
  }

  async updateCourierStatus(courierId: string, status: Courier['status']): Promise<{
    status: Courier['status'];
  }> {
    if (this.useMockData) {
      return mockAuthService.updateCourierStatus(courierId, status);
    }

    const response = await apiClient.put(`/courier/${courierId}/status`, { status });
    return response.data;
  }

  async updateOnlineStatus(courierId: string, isOnline: boolean): Promise<{
    isOnline: boolean;
  }> {
    if (this.useMockData) {
      return mockAuthService.updateOnlineStatus(courierId, isOnline);
    }

    const response = await apiClient.put(`/courier/${courierId}/online-status`, { isOnline });
    return response.data;
  }

  async forgotPassword(email: string): Promise<void> {
    if (this.useMockData) {
      return mockAuthService.forgotPassword(email);
    }

    await apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (this.useMockData) {
      return mockAuthService.resetPassword(token, newPassword);
    }

    await apiClient.post('/auth/reset-password', { token, newPassword });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (this.useMockData) {
      return mockAuthService.changePassword(currentPassword, newPassword);
    }

    await apiClient.put('/auth/change-password', { currentPassword, newPassword });
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (this.useMockData) {
      return mockAuthService.updateProfile(updates);
    }

    const response = await apiClient.put('/auth/profile', updates);
    return response.data;
  }

  async deleteAccount(): Promise<void> {
    if (this.useMockData) {
      return mockAuthService.deleteAccount();
    }

    await apiClient.delete('/auth/account');
  }
}

export const authService = new AuthService();