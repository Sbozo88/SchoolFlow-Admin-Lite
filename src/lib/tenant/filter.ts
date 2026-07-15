/** Pure tenant isolation helpers used by data access and unit tests. */

export function belongsToTenant(
  doc: { tenantId?: string | null } | null | undefined,
  tenantId: string | null | undefined,
): boolean {
  if (!tenantId || !doc?.tenantId) return false;
  return doc.tenantId === tenantId;
}

export function filterByTenant<T extends { tenantId?: string | null }>(
  records: T[],
  tenantId: string | null | undefined,
): T[] {
  if (!tenantId) return [];
  return records.filter((record) => record.tenantId === tenantId);
}

/** Reject cross-tenant mutation attempts. */
export function assertSameTenant(
  docTenantId: string | null | undefined,
  activeTenantId: string | null | undefined,
  action = "access",
): void {
  if (!activeTenantId) {
    throw new Error(`Cannot ${action}: no active tenant context.`);
  }
  if (!docTenantId || docTenantId !== activeTenantId) {
    throw new Error(`Cannot ${action}: tenant isolation violation.`);
  }
}

/** Shape used to build Firestore where constraints (tests assert this is always present). */
export function tenantQueryConstraint(tenantId: string): {
  field: "tenantId";
  op: "==";
  value: string;
} {
  if (!tenantId?.trim()) {
    throw new Error("tenantId is required for tenant-scoped queries.");
  }
  return { field: "tenantId", op: "==", value: tenantId };
}

export function denyCrossTenantRead<T extends { tenantId?: string | null }>(
  records: T[],
  requestedTenantId: string,
  activeTenantId: string,
): T[] {
  if (requestedTenantId !== activeTenantId) {
    return [];
  }
  return filterByTenant(records, activeTenantId);
}
