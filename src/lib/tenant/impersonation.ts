import type { ImpersonationMode, ImpersonationSession } from "@/lib/tenant/types";
import { buildAuditLogEntry } from "@/lib/audit/auditLog";

const DEFAULT_TTL_MS = 30 * 60 * 1000;

export const IMPERSONATION_STORAGE_KEY = "schoolflow.impersonation";

export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export function startImpersonationSession(input: {
  tenantId: string;
  mode: ImpersonationMode;
  startedBy: string;
  ttlMs?: number;
  now?: () => Date;
}): ImpersonationSession {
  if (!input.tenantId?.trim()) throw new Error("tenantId required for impersonation");
  if (!input.startedBy?.trim()) throw new Error("startedBy required for impersonation");
  if (input.mode !== "read" && input.mode !== "support") {
    throw new Error("impersonation mode must be read or support");
  }
  const now = input.now?.() ?? new Date();
  const ttl = input.ttlMs ?? DEFAULT_TTL_MS;
  return {
    tenantId: input.tenantId,
    mode: input.mode,
    startedAt: now.toISOString(),
    startedBy: input.startedBy,
    expiresAt: new Date(now.getTime() + ttl).toISOString(),
  };
}

export function isImpersonationActive(
  session: ImpersonationSession | null | undefined,
  now: () => Date = () => new Date(),
): boolean {
  if (!session) return false;
  return new Date(session.expiresAt).getTime() > now().getTime();
}

/** Impersonation is only valid for the platform user who started it. */
export function isImpersonationOwnedBy(
  session: ImpersonationSession | null | undefined,
  userId: string | null | undefined,
): boolean {
  if (!session || !userId?.trim()) return false;
  return session.startedBy === userId;
}

/**
 * Resolve a restored session for the *current* signed-in user.
 * Rejects expired sessions and sessions started by a different uid
 * (prevents cross-login inheritance of support context).
 */
export function resolveRestoredImpersonation(
  session: ImpersonationSession | null | undefined,
  currentUserId: string | null | undefined,
  now: () => Date = () => new Date(),
): ImpersonationSession | null {
  if (!session) return null;
  if (!isImpersonationActive(session, now)) return null;
  if (!isImpersonationOwnedBy(session, currentUserId)) return null;
  return session;
}

export function canWriteWhileImpersonating(session: ImpersonationSession | null | undefined): boolean {
  if (!session || !isImpersonationActive(session)) return true; // not impersonating → normal path
  return session.mode === "support";
}

export function buildImpersonationStartAudit(session: ImpersonationSession) {
  return buildAuditLogEntry({
    userId: session.startedBy,
    action: "impersonation.start",
    tenantId: session.tenantId,
    detail: `mode=${session.mode}`,
    meta: { expiresAt: session.expiresAt },
  });
}

export function buildImpersonationEndAudit(session: ImpersonationSession, endedBy: string) {
  return buildAuditLogEntry({
    userId: endedBy,
    action: "impersonation.end",
    tenantId: session.tenantId,
    detail: `mode=${session.mode}`,
  });
}

export function parseImpersonationSession(raw: string | null): ImpersonationSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ImpersonationSession;
    if (!parsed?.tenantId || !parsed?.startedBy || !parsed?.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readImpersonationFromStorage(storage: StorageLike): ImpersonationSession | null {
  return parseImpersonationSession(storage.getItem(IMPERSONATION_STORAGE_KEY));
}

/** Persist impersonation for the current browser tab. */
export function writeImpersonationToStorage(storage: StorageLike, session: ImpersonationSession): void {
  storage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify(session));
}

/** Clear support impersonation (logout, end, ownership mismatch). */
export function clearImpersonationFromStorage(storage: StorageLike): void {
  storage.removeItem(IMPERSONATION_STORAGE_KEY);
}

/**
 * End of session cleanup used by logout: clear storage and optionally return
 * an audit payload when a valid owned session was active.
 */
export function endImpersonationOnLogout(input: {
  storage: StorageLike;
  currentUserId: string | null | undefined;
  now?: () => Date;
}): { cleared: boolean; endAudit: ReturnType<typeof buildImpersonationEndAudit> | null } {
  const stored = readImpersonationFromStorage(input.storage);
  const active = resolveRestoredImpersonation(stored, input.currentUserId, input.now);
  clearImpersonationFromStorage(input.storage);
  if (active && input.currentUserId) {
    return {
      cleared: true,
      endAudit: buildImpersonationEndAudit(active, input.currentUserId),
    };
  }
  return { cleared: Boolean(stored), endAudit: null };
}
