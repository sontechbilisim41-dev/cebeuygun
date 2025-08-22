
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { storage } from '@/lib/localStorage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          // Simulate API call
          const users = storage.getUsers();
          const user = users.find((u: User) => u.email === email);
          
          if (user) {
            set({ user, isAuthenticated: true });
            storage.setCurrentUser(user);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        storage.remove('currentUser');
      },

      register: async (userData: Partial<User>) => {
        try {
          const users = storage.getUsers();
          const newUser: User = {
            id: `user_${Date.now()}`,
            email: userData.email!,
            name: userData.name!,
            phone: userData.phone,
            role: userData.role || 'customer',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...userData
          };

          users.push(newUser);
          storage.setUsers(users);
          
          set({ user: newUser, isAuthenticated: true });
          storage.setCurrentUser(newUser);
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      },

      updateProfile: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
          set({ user: updatedUser });
          storage.setCurrentUser(updatedUser);
          
          // Update in users list
          const users = storage.getUsers();
          const userIndex = users.findIndex((u: User) => u.id === user.id);
          if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            storage.setUsers(users);
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
