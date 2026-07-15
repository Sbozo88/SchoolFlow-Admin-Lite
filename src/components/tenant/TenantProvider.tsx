"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  IMPERSONATION_STORAGE_KEY,
  buildImpersonationEndAudit,
  buildImpersonationStartAudit,
  canWriteWhileImpersonating,
  clearImpersonationFromStorage,
  isImpersonationActive,
  parseImpersonationSession,
  resolveRestoredImpersonation,
  startImpersonationSession,
  writeImpersonationToStorage,
} from "@/lib/tenant/impersonation";
import type { ImpersonationMode, ImpersonationSession } from "@/lib/tenant/types";
import type { TenantWriteContext } from "@/lib/tenant/types";
import { writeAuditLog } from "@/firebase/audit";
import { canPlatform } from "@/lib/permissions/matrix";

const IMPERSONATION_CHANGE_EVENT = "schoolflow-impersonation-change";

type TenantContextValue = {
  activeTenantId: string | null;
  homeTenantId: string | null;
  impersonation: ImpersonationSession | null;
  isImpersonating: boolean;
  canWrite: boolean;
  writeContext: TenantWriteContext | null;
  startImpersonation: (tenantId: string, mode?: ImpersonationMode) => void;
  endImpersonation: () => void;
};

const TenantContext = createContext<TenantContextValue | null>(null);

function notifyImpersonationStorageChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(IMPERSONATION_CHANGE_EVENT));
}

function subscribeImpersonationStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(IMPERSONATION_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(IMPERSONATION_CHANGE_EVENT, handler);
  };
}

function getImpersonationStorageSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(IMPERSONATION_STORAGE_KEY);
}

function getImpersonationServerSnapshot(): string | null {
  return null;
}

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();

  const rawJson = useSyncExternalStore(
    subscribeImpersonationStorage,
    getImpersonationStorageSnapshot,
    getImpersonationServerSnapshot,
  );

  const storedSession = useMemo(() => parseImpersonationSession(rawJson), [rawJson]);

  // Ownership + TTL: different uid never inherits prior support context (pure resolve)
  const impersonation = useMemo(
    () => resolveRestoredImpersonation(storedSession, user?.uid ?? null),
    [storedSession, user?.uid],
  );

  const homeTenantId = profile?.tenantId ?? null;
  const isImpersonating = Boolean(impersonation && isImpersonationActive(impersonation));
  const activeTenantId = isImpersonating ? impersonation!.tenantId : homeTenantId;
  const canWrite = isImpersonating ? canWriteWhileImpersonating(impersonation) : true;

  const startImpersonation = useCallback(
    (tenantId: string, mode: ImpersonationMode = "read") => {
      if (!user || !profile?.platformRole) {
        throw new Error("Only platform users can impersonate tenants.");
      }
      if (
        !canPlatform(profile.platformRole, "platform.impersonate") &&
        profile.platformRole !== "super_admin"
      ) {
        throw new Error("Missing platform.impersonate permission.");
      }
      const safeMode =
        profile.platformRole === "super_admin" && mode === "support" ? "support" : "read";
      const safeSession = startImpersonationSession({
        tenantId,
        mode: safeMode,
        startedBy: user.uid,
      });
      const storage = browserStorage();
      if (storage) {
        writeImpersonationToStorage(storage, safeSession);
        notifyImpersonationStorageChanged();
      }
      const audit = buildImpersonationStartAudit(safeSession);
      void writeAuditLog({
        userId: audit.userId,
        action: audit.action,
        tenantId: audit.tenantId,
        detail: audit.detail,
        meta: audit.meta,
      });
    },
    [profile, user],
  );

  const endImpersonation = useCallback(() => {
    if (impersonation && user) {
      const audit = buildImpersonationEndAudit(impersonation, user.uid);
      void writeAuditLog({
        userId: audit.userId,
        action: audit.action,
        tenantId: audit.tenantId,
        detail: audit.detail,
      });
    }
    const storage = browserStorage();
    if (storage) {
      clearImpersonationFromStorage(storage);
      notifyImpersonationStorageChanged();
    }
  }, [impersonation, user]);

  const writeContext = useMemo<TenantWriteContext | null>(() => {
    if (!activeTenantId || !user) return null;
    return { tenantId: activeTenantId, userId: user.uid };
  }, [activeTenantId, user]);

  const value = useMemo(
    () => ({
      activeTenantId,
      homeTenantId,
      impersonation: isImpersonating ? impersonation : null,
      isImpersonating,
      canWrite,
      writeContext,
      startImpersonation,
      endImpersonation,
    }),
    [
      activeTenantId,
      homeTenantId,
      impersonation,
      isImpersonating,
      canWrite,
      writeContext,
      startImpersonation,
      endImpersonation,
    ],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return ctx;
}

/** Optional hook when provider may be absent (e.g. public pages). */
export function useOptionalTenant(): TenantContextValue | null {
  return useContext(TenantContext);
}
