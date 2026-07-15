import { canAccessClientWorkspace, type PlatformRole, type TenantRole } from "@/lib/permissions/roles";

/** Pure gate used by ProtectedRoute — unit tests drive this shipped function. */
export function canStayOnClientWorkspace(input: {
  role: "admin" | null;
  platformRole: PlatformRole | null;
  tenantRole: TenantRole | null;
  homeTenantId: string | null;
  isImpersonating: boolean;
}): boolean {
  if (input.role === "admin") return true;
  if (canAccessClientWorkspace(input.tenantRole)) return true;
  if (input.platformRole && input.isImpersonating) return true;
  if (input.platformRole && input.homeTenantId) return true;
  return false;
}

/** Platform users without tenant membership should leave /admin unless impersonating. */
export function shouldRedirectPlatformUserFromAdmin(input: {
  platformRole: PlatformRole | null;
  homeTenantId: string | null;
  tenantRole: TenantRole | null;
  isImpersonating: boolean;
}): boolean {
  if (!input.platformRole) return false;
  if (input.homeTenantId || input.tenantRole) return false;
  if (input.isImpersonating) return false;
  return true;
}
