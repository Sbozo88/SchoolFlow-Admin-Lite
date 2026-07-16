export type AuditAction =
  | "login"
  | "logout"
  | "user.create"
  | "user.role_change"
  | "client.create"
  | "client.update"
  | "client.suspend"
  | "client.reactivate"
  | "client.archive"
  | "client.delete"
  | "data.delete"
  | "impersonation.start"
  | "impersonation.end"
  | "billing.update"
  | "invite.resend"
  | "password.reset_request";

export type AuditLogEntry = {
  id?: string;
  timestamp: string;
  tenantId: string | null;
  userId: string;
  action: AuditAction;
  detail?: string;
  device?: string | null;
  ip?: string | null;
  meta?: Record<string, unknown>;
};

export function buildAuditLogEntry(input: {
  userId: string;
  action: AuditAction;
  tenantId?: string | null;
  detail?: string;
  device?: string | null;
  ip?: string | null;
  meta?: Record<string, unknown>;
  now?: () => Date;
}): AuditLogEntry {
  if (!input.userId?.trim()) throw new Error("userId is required for audit log");
  if (!input.action) throw new Error("action is required for audit log");
  const now = input.now?.() ?? new Date();
  const entry: AuditLogEntry = {
    timestamp: now.toISOString(),
    tenantId: input.tenantId ?? null,
    userId: input.userId,
    action: input.action,
    device: input.device ?? null,
    ip: input.ip ?? null,
  };
  if (input.detail !== undefined) entry.detail = input.detail;
  if (input.meta !== undefined) entry.meta = input.meta;
  return entry;
}

export function isValidAuditEntry(entry: Partial<AuditLogEntry>): boolean {
  return Boolean(
    entry.timestamp &&
      entry.userId &&
      entry.action &&
      (entry.tenantId === null || typeof entry.tenantId === "string"),
  );
}
