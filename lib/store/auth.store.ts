import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  role: "CANDIDATE" | "ADMIN";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("stasrg_token", token);
      localStorage.setItem("stasrg_user", JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("stasrg_token");
      localStorage.removeItem("stasrg_user");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("stasrg_token");
      const userStr = localStorage.getItem("stasrg_user");
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token, isAuthenticated: true });
        } catch {
          localStorage.removeItem("stasrg_token");
          localStorage.removeItem("stasrg_user");
        }
      }
    }
  },
}));
