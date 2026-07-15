import type { Role } from "@/lib/types";
import {
  canPlatform,
  canTenant,
  type Permission,
  permissionsForPlatformRole,
  permissionsForTenantRole,
} from "@/lib/permissions/matrix";
import {
  isPlatformRole,
  isTenantRole,
  normalizePlatformRole,
  normalizeTenantRole,
  type PlatformRole,
  type TenantRole,
} from "@/lib/permissions/roles";

/** @deprecated Prefer platform/tenant permission matrices; kept for legacy Role type. */
export const rolePermissions: Record<Role, string[]> = {
  admin: ["*"],
};

export function can(role: Role | null | undefined, permission: string) {
  if (!role) {
    return false;
  }

  const permissions = rolePermissions[role];
  return permissions.includes("*") || permissions.includes(permission);
}

/** Legacy normalize — admin only. Prefer normalizeTenantRole / normalizePlatformRole. */
export function normalizeRole(value: unknown): Role | null {
  if (value === "admin" || value === "client_admin") return "admin";
  return null;
}

export function canAny(input: {
  platformRole?: PlatformRole | null;
  tenantRole?: TenantRole | null;
  permission: Permission;
}): boolean {
  if (input.platformRole && canPlatform(input.platformRole, input.permission)) return true;
  if (input.tenantRole && canTenant(input.tenantRole, input.permission)) return true;
  return false;
}

export {
  canPlatform,
  canTenant,
  permissionsForPlatformRole,
  permissionsForTenantRole,
  isPlatformRole,
  isTenantRole,
  normalizePlatformRole,
  normalizeTenantRole,
};
export type { PlatformRole, TenantRole, Permission };
