import { LoginForm, RegisterForm, User, Courier } from '@/types';

// Mock user data
const mockUser: User = {
  id: 'user-123',
  email: 'courier@example.com',
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  phone: '+90 555 123 4567',
  role: 'courier',
  status: 'active',
  profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T15:30:00Z',
};

const mockCourier: Courier = {
  id: 'courier-123',
  userId: 'user-123',
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  phone: '+90 555 123 4567',
  email: 'courier@example.com',
  vehicleType: 'MOTORBIKE',
  vehiclePlate: '34 ABC 123',
  status: 'INACTIVE',
  rating: 4.8,
  completedOrders: 247,
  isOnline: false,
  lastSeenAt: '2024-01-20T15:30:00Z',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T15:30:00Z',
};

const mockTokens = {
  accessToken: 'mock-access-token-123',
  refreshToken: 'mock-refresh-token-456',
};

class MockAuthService {
  async login(credentials: LoginForm): Promise<{
    user: User;
    courier: Courier;
    accessToken: string;
    refreshToken: string;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (credentials.email === 'courier@example.com' && credentials.password === 'password123') {
      return {
        user: mockUser,
        courier: mockCourier,
        ...mockTokens,
      };
    }

    throw new Error('Invalid email or password');
  }

  async register(userData: RegisterForm): Promise<{
    user: User;
    courier: Courier;
    accessToken: string;
    refreshToken: string;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock validation
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (userData.email === 'existing@example.com') {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      ...mockUser,
      id: `user-${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newCourier: Courier = {
      ...mockCourier,
      id: `courier-${Date.now()}`,
      userId: newUser.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      vehicleType: userData.vehicleType,
      vehiclePlate: userData.vehiclePlate,
      completedOrders: 0,
      rating: 5.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user: newUser,
      courier: newCourier,
      ...mockTokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (refreshToken === mockTokens.refreshToken) {
      return {
        accessToken: `new-access-token-${Date.now()}`,
        refreshToken: `new-refresh-token-${Date.now()}`,
      };
    }

    throw new Error('Invalid refresh token');
  }

  async verifyToken(accessToken: string): Promise<{
    user: User;
    courier: Courier;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (accessToken.includes('mock-access-token') || accessToken.includes('new-access-token')) {
      return {
        user: mockUser,
        courier: mockCourier,
      };
    }

    throw new Error('Invalid access token');
  }

  async logout(refreshToken: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock logout - always succeeds
  }

  async updateCourierStatus(courierId: string, status: Courier['status']): Promise<{
    status: Courier['status'];
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return { status };
  }

  async updateOnlineStatus(courierId: string, isOnline: boolean): Promise<{
    isOnline: boolean;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    return { isOnline };
  }

  async forgotPassword(email: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!email.includes('@')) {
      throw new Error('Invalid email address');
    }

    // Mock success - always succeeds for valid email format
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Mock success
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (currentPassword !== 'password123') {
      throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    // Mock success
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      ...mockUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteAccount(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock success
  }
}

export const mockAuthService = new MockAuthService();