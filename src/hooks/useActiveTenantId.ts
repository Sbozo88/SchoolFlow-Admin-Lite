import { useAuth } from "@/components/auth/AuthProvider";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";

/**
 * Resolves the tenant used for school data queries.
 * Prefers impersonation / active tenant over the profile home tenant.
 */
export function useActiveTenantId(publicTenantId?: string | null): string | null {
  const { profile } = useAuth();
  const tenant = useOptionalTenant();
  return tenant?.activeTenantId ?? profile?.tenantId ?? publicTenantId ?? null;
}
