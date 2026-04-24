import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import Cookies from 'js-cookie';

interface AuthState {
  user: User | null;
  jwt: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, jwt: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      jwt: null,
      isAuthenticated: false,

      setAuth: (user, jwt) => {
        // Set cookie for middleware access
        Cookies.set('jwt', jwt, { expires: 7 }); // 7 days
        set({
          user,
          jwt,
          isAuthenticated: true,
        });
      },

      logout: () => {
        // Remove cookie
        Cookies.remove('jwt');
        set({
          user: null,
          jwt: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
