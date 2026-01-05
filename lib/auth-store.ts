// lib/auth-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "client" | "gerant" | "admin" | "superadmin"

export interface User {
  _id?: string
  email: string
  username: string
  telephone?: string
  role: UserRole
  createdAt: string
  avatar?: string
  salonId?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<boolean>
  register: (data: Omit<User, "_id" | "createdAt" | "role"> & { password: string }) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (identifier, password) => {
        try {
          const res = await fetch("http://localhost:3500/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Échec de connexion");
          }

          const data = await res.json();

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });

          return true;
        } catch (err) {
          console.error("Login error:", err);
          return false;
        }
      },

      register: async (userData) => {
        try {
          const res = await fetch("http://localhost:3500/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Échec d'inscription");
          }

          const data = await res.json();

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });

          return true;
        } catch (err) {
          console.error("Register error:", err);
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: async (userData) => {
        try {
          const token = get().token;
          if (!token) return false;

          const res = await fetch("http://localhost:3500/api/me1", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          });

          if (!res.ok) throw new Error("Erreur mise à jour profil");

          const data = await res.json();
          set({ user: data.user });
          return true;
        } catch (error) {
          console.error("Update profile error:", error);
          return false;
        }
      },

      resetPassword: async () => true,
    }),
    {
      name: "nappylocks-auth",
      // SUPPRIME skipHydration: true → c'est ce qui cassait tout !
      // L'hydratation est nécessaire pour que le token soit disponible côté client
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);