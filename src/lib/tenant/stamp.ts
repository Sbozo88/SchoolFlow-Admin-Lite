import type { TenantDocumentMeta, TenantWriteContext } from "@/lib/tenant/types";

export type TimestampProvider = {
  now: () => unknown;
};

/** Stamp create payload with required tenant metadata fields. */
export function stampTenantCreate<T extends Record<string, unknown>>(
  payload: T,
  ctx: TenantWriteContext,
  timestamps: TimestampProvider,
): T & TenantDocumentMeta {
  if (!ctx.tenantId?.trim()) {
    throw new Error("tenantId is required to create a tenant-scoped record.");
  }
  if (!ctx.userId?.trim()) {
    throw new Error("createdBy (userId) is required to create a tenant-scoped record.");
  }
  const now = timestamps.now();
  return {
    ...payload,
    tenantId: ctx.tenantId,
    createdBy: ctx.userId,
    createdAt: now,
    updatedAt: now,
  };
}

/** Stamp update payload with updatedAt; never allows tenantId reassignment via update. */
export function stampTenantUpdate<T extends Record<string, unknown>>(
  payload: T,
  timestamps: TimestampProvider,
): Omit<T, "tenantId" | "createdBy" | "createdAt"> & { updatedAt: unknown } {
  const rest = { ...payload } as T & Partial<TenantDocumentMeta>;
  delete rest.tenantId;
  delete rest.createdBy;
  delete rest.createdAt;
  return {
    ...(rest as Omit<T, "tenantId" | "createdBy" | "createdAt">),
    updatedAt: timestamps.now(),
  };
}

export function hasRequiredTenantMeta(doc: Partial<TenantDocumentMeta> | null | undefined): boolean {
  if (!doc) return false;
  return Boolean(
    typeof doc.tenantId === "string" &&
      doc.tenantId.trim() &&
      typeof doc.createdBy === "string" &&
      doc.createdBy.trim() &&
      doc.createdAt != null &&
      doc.updatedAt != null,
  );
}
