import { canAccessClientWorkspace, type PlatformRole, type TenantRole } from "@/lib/permissions/roles";

/**
 * Pure gate used by ProtectedRoute for the school client workspace (/school).
 * Super Admin must NOT pass this unless impersonating a tenant.
 */
export function canStayOnClientWorkspace(input: {
  role: "admin" | null;
  platformRole: PlatformRole | null;
  tenantRole: TenantRole | null;
  homeTenantId: string | null;
  isImpersonating: boolean;
}): boolean {
  // Support impersonation into a school
  if (input.platformRole && input.isImpersonating) return true;

  // School users must be bound to a tenant
  if (!input.homeTenantId) return false;

  if (input.role === "admin") return true;
  if (canAccessClientWorkspace(input.tenantRole)) return true;

  // Platform user who also has a home tenant (unusual) can open client workspace
  if (input.platformRole && input.homeTenantId) return true;

  return false;
}

/**
 * Redirect away from school /school to Super Admin when the user is not a school member
 * and not actively impersonating.
 */
export function shouldRedirectPlatformUserFromAdmin(input: {
  platformRole: PlatformRole | null;
  homeTenantId: string | null;
  tenantRole: TenantRole | null;
  isImpersonating: boolean;
}): boolean {
  if (input.isImpersonating) return false;
  // Bound to a school → stay on client workspace
  if (input.homeTenantId) return false;
  // Unbound (platform Super Admin, or legacy admin without tenant) → Super Admin UI
  return true;
}

/** Who may enter /super-admin */
export function canAccessPlatformWorkspace(input: {
  platformRole: PlatformRole | null;
  homeTenantId: string | null;
  tenantRole: TenantRole | null;
}): boolean {
  if (input.platformRole) return true;
  // Unbound signed-in operators can open Super Admin to run bootstrap
  if (!input.homeTenantId) return true;
  return false;
}
