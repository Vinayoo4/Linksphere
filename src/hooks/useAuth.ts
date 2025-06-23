import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAdmin: boolean;
  isPinVerified: boolean;
  pin: string;
  setIsAdmin: (isAdmin: boolean) => void;
  verifyPin: (pin: string) => boolean;
  setPin: (pin: string) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAdmin: true, // For demo purposes
      isPinVerified: false,
      pin: '1234', // Default PIN, in production this would be properly hashed
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      verifyPin: (inputPin) => {
        const isValid = inputPin === get().pin;
        if (isValid) {
          set({ isPinVerified: true });
        }
        return isValid;
      },
      setPin: (newPin) => set({ pin: newPin }),
    }),
    {
      name: 'auth-storage',
    }
  )
);