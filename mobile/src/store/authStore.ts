import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // TODO: Implement API call
      // Mock user for now
      const mockUser: User = {
        id: '1',
        email,
        name: 'Test User',
        isPremium: false,
        createdAt: new Date(),
      };

      set({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false
    });
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    try {
      // TODO: Implement API call
      const mockUser: User = {
        id: '1',
        email,
        name,
        isPremium: false,
        createdAt: new Date(),
      };

      set({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));