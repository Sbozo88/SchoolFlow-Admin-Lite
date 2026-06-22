"use client";

import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getAdminRole,
  observeAuthState,
  sendAdminPasswordReset,
  setAuthPersistence,
  signInWithEmail,
  signInWithGoogle,
  signOutAdmin,
} from "@/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { Role } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  role: Role | null;
  loading: boolean;
  authError: string;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isConfigured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(isConfigured);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!isConfigured) {
      return undefined;
    }

    void setAuthPersistence();

    return observeAuthState(async (currentUser) => {
      setLoading(true);
      setAuthError("");
      setUser(currentUser);

      if (!currentUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        setRole(await getAdminRole(currentUser.uid));
      } catch {
        setRole(null);
        setAuthError("Your profile could not be loaded. Check the users/{uid} document and Firestore rules.");
      } finally {
        setLoading(false);
      }
    });
  }, [isConfigured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      loading,
      authError,
      isConfigured,
      login: async (email, password) => {
        if (!isConfigured) {
          throw new Error("Firebase is not configured.");
        }
        await signInWithEmail(email, password);
      },
      loginWithGoogle: async () => {
        if (!isConfigured) {
          throw new Error("Firebase is not configured.");
        }
        await signInWithGoogle();
      },
      logout: signOutAdmin,
      resetPassword: async (email) => {
        if (!isConfigured) {
          throw new Error("Firebase is not configured.");
        }
        await sendAdminPasswordReset(email);
      },
    }),
    [authError, isConfigured, loading, role, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
