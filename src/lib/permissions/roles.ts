/** Platform (SaaS owner) roles */
export type PlatformRole = "super_admin" | "platform_support" | "platform_manager";

/**
 * Tenant (client org) roles.
 * Logistics OBJECTIVE labels map to SchoolFlow duties; `admin` retained for legacy profiles.
 */
export type TenantRole =
  | "admin"
  | "client_admin"
  | "manager"
  | "dispatcher"
  | "driver"
  | "finance"
  | "viewer";

export type AppRole = PlatformRole | TenantRole;

export const PLATFORM_ROLES: PlatformRole[] = [
  "super_admin",
  "platform_support",
  "platform_manager",
];

export const TENANT_ROLES: TenantRole[] = [
  "admin",
  "client_admin",
  "manager",
  "dispatcher",
  "driver",
  "finance",
  "viewer",
];

export function isPlatformRole(value: unknown): value is PlatformRole {
  return typeof value === "string" && (PLATFORM_ROLES as string[]).includes(value);
}

export function isTenantRole(value: unknown): value is TenantRole {
  return typeof value === "string" && (TENANT_ROLES as string[]).includes(value);
}

/** Normalize legacy + new role strings. */
export function normalizeTenantRole(value: unknown): TenantRole | null {
  if (value === "admin" || value === "client_admin") return value === "client_admin" ? "client_admin" : "admin";
  if (isTenantRole(value)) return value;
  return null;
}

export function normalizePlatformRole(value: unknown): PlatformRole | null {
  return isPlatformRole(value) ? value : null;
}

/** Tenant roles allowed into the school-ops `/admin` workspace. */
export function canAccessClientWorkspace(role: TenantRole | null | undefined): boolean {
  if (!role) return false;
  return ["admin", "client_admin", "manager", "dispatcher", "finance", "viewer", "driver"].includes(role);
}

/** Roles that can mutate school operational data. */
export function canMutateTenantData(role: TenantRole | null | undefined): boolean {
  if (!role) return false;
  return ["admin", "client_admin", "manager", "dispatcher", "finance"].includes(role);
}
