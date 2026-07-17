"use client";

import type { User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  observeAuthState,
  sendAdminPasswordReset,
  setAuthPersistence,
  signInWithEmail,
  signInWithGoogle,
  signOutAdmin,
} from "@/firebase/auth";
import { getUserProfile, type UserProfile } from "@/firebase/userProfile";
import { writeAuditLog } from "@/firebase/audit";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { Role } from "@/lib/types";
import {
  homePathForWorkspace,
  resolveWorkspace,
  type Permission,
} from "@/lib/permissions/matrix";
import { canAny } from "@/lib/rbac";
import type { PlatformRole, TenantRole } from "@/lib/permissions/roles";
import { normalizeRole } from "@/lib/rbac";
import { endImpersonationOnLogout } from "@/lib/tenant/impersonation";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  /** Legacy: tenant admin role mapped to "admin" for existing ProtectedRoute. */
  role: Role | null;
  platformRole: PlatformRole | null;
  tenantRole: TenantRole | null;
  tenantId: string | null;
  workspace: "platform" | "client" | "none";
  homePath: string;
  loading: boolean;
  authError: string;
  isConfigured: boolean;
  can: (permission: Permission) => boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /** Force-refresh Firebase claims and the Firestore profile after privileged mutations. */
  refreshSession: () => Promise<UserProfile | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isConfigured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(isConfigured);
  const [authError, setAuthError] = useState("");
  /** Only true after interactive login(); session restore must not write audit "login". */
  const interactiveLoginRef = useRef(false);

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
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const nextProfile = await getUserProfile(currentUser.uid);
        setProfile(nextProfile);
        if (!nextProfile) {
          setAuthError(
            "Your profile could not be loaded. Check the users/{uid} document (role, platformRole, tenantId) and Firestore rules.",
          );
        } else if (interactiveLoginRef.current) {
          interactiveLoginRef.current = false;
          void writeAuditLog({
            userId: currentUser.uid,
            action: "login",
            tenantId: nextProfile.tenantId,
            detail: "interactive_sign_in",
          });
        }
      } catch {
        setProfile(null);
        setAuthError(
          "Your profile could not be loaded. Check the users/{uid} document and Firestore rules.",
        );
      } finally {
        setLoading(false);
      }
    });
  }, [isConfigured]);

  const platformRole = profile?.platformRole ?? null;
  const tenantRole = profile?.role ?? null;
  const tenantId = profile?.tenantId ?? null;
  const workspace = resolveWorkspace(platformRole, tenantRole, tenantId);
  const homePath = homePathForWorkspace(workspace);
  const role: Role | null = normalizeRole(tenantRole) ?? (platformRole ? null : null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      role,
      platformRole,
      tenantRole,
      tenantId,
      workspace,
      homePath,
      loading,
      authError,
      isConfigured,
      can: (permission: Permission) =>
        canAny({ platformRole, tenantRole, permission }),
      login: async (email, password) => {
        if (!isConfigured) {
          throw new Error("Firebase is not configured.");
        }
        interactiveLoginRef.current = true;
        try {
          await signInWithEmail(email, password);
        } catch (error) {
          interactiveLoginRef.current = false;
          throw error;
        }
      },
      loginWithGoogle: async () => {
        if (!isConfigured) {
          throw new Error("Firebase is not configured.");
        }
        interactiveLoginRef.current = true;
        try {
          await signInWithGoogle();
        } catch (error) {
          interactiveLoginRef.current = false;
          throw error;
        }
      },
      refreshSession: async () => {
        if (!user) return null;
        await user.getIdToken(true);
        const nextProfile = await getUserProfile(user.uid);
        setProfile(nextProfile);
        setAuthError(nextProfile ? "" : "Your updated profile could not be loaded.");
        return nextProfile;
      },
      logout: async () => {
        if (typeof window !== "undefined") {
          const endResult = endImpersonationOnLogout({
            storage: window.sessionStorage,
            currentUserId: user?.uid ?? null,
          });
          if (endResult.endAudit) {
            void writeAuditLog({
              userId: endResult.endAudit.userId,
              action: endResult.endAudit.action,
              tenantId: endResult.endAudit.tenantId,
              detail: endResult.endAudit.detail,
            });
          }
          window.dispatchEvent(new Event("schoolflow-impersonation-change"));
        }
        if (user) {
          void writeAuditLog({
            userId: user.uid,
            action: "logout",
            tenantId: tenantId,
          });
        }
        await signOutAdmin();
      },
      resetPassword: async (email) => {
        if (!isConfigured) {
          throw new Error("Firebase is not configured.");
        }
        await sendAdminPasswordReset(email);
        if (user) {
          void writeAuditLog({
            userId: user.uid,
            action: "password.reset_request",
            tenantId,
            detail: email,
          });
        }
      },
    }),
    [
      authError,
      homePath,
      isConfigured,
      loading,
      platformRole,
      profile,
      role,
      tenantId,
      tenantRole,
      user,
      workspace,
    ],
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
