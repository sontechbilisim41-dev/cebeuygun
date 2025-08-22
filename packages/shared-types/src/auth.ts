import { BaseEntity } from './common';

export type UserRole = 'customer' | 'seller' | 'courier' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned';

export interface User extends BaseEntity {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}