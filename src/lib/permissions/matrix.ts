import type { PlatformRole, TenantRole } from "@/lib/permissions/roles";

/** Central permission catalog (reusable, pure). */
export const PERMISSIONS = {
  // Platform
  "platform.clients.read": "View client organizations",
  "platform.clients.write": "Create/edit client organizations",
  "platform.clients.lifecycle": "Suspend/reactivate/archive/delete clients",
  "platform.users.read": "View platform users",
  "platform.users.write": "Manage platform users",
  "platform.billing.read": "View billing plans and invoices",
  "platform.billing.write": "Assign plans and update billing status",
  "platform.audit.read": "View audit logs",
  "platform.support": "Support tools and password-reset hooks",
  "platform.impersonate": "Impersonate tenant workspace",
  "platform.monitor": "Platform monitoring dashboard",
  // Tenant
  "tenant.dashboard": "View tenant dashboard",
  "tenant.learners": "Manage learners",
  "tenant.attendance": "Manage attendance",
  "tenant.payments": "Manage payments",
  "tenant.followups": "Manage parent follow-ups",
  "tenant.reports": "View reports",
  "tenant.settings": "Manage organization settings",
  "tenant.users": "Manage tenant users",
  "tenant.submissions": "Review parent submissions",
} as const;

export type Permission = keyof typeof PERMISSIONS;

const platformMatrix: Record<PlatformRole, Permission[] | ["*"]> = {
  super_admin: ["*"],
  platform_manager: [
    "platform.clients.read",
    "platform.clients.write",
    "platform.clients.lifecycle",
    "platform.users.read",
    "platform.billing.read",
    "platform.billing.write",
    "platform.audit.read",
    "platform.monitor",
  ],
  platform_support: [
    "platform.clients.read",
    "platform.users.read",
    "platform.billing.read",
    "platform.audit.read",
    "platform.support",
    "platform.impersonate",
    "platform.monitor",
  ],
};

const tenantMatrix: Record<TenantRole, Permission[] | ["*"]> = {
  admin: ["*"],
  client_admin: ["*"],
  manager: [
    "tenant.dashboard",
    "tenant.learners",
    "tenant.attendance",
    "tenant.payments",
    "tenant.followups",
    "tenant.reports",
    "tenant.submissions",
    "tenant.settings",
  ],
  dispatcher: [
    "tenant.dashboard",
    "tenant.learners",
    "tenant.attendance",
    "tenant.followups",
    "tenant.reports",
  ],
  driver: ["tenant.dashboard", "tenant.attendance"],
  finance: [
    "tenant.dashboard",
    "tenant.payments",
    "tenant.reports",
    "tenant.learners",
  ],
  viewer: [
    "tenant.dashboard",
    "tenant.learners",
    "tenant.attendance",
    "tenant.payments",
    "tenant.followups",
    "tenant.reports",
    "tenant.submissions",
  ],
};

export function permissionsForPlatformRole(role: PlatformRole | null | undefined): Permission[] {
  if (!role) return [];
  const list = platformMatrix[role];
  if (!list) return [];
  if (list[0] === "*") return Object.keys(PERMISSIONS) as Permission[];
  return list as Permission[];
}

export function permissionsForTenantRole(role: TenantRole | null | undefined): Permission[] {
  if (!role) return [];
  const list = tenantMatrix[role];
  if (!list) return [];
  if (list[0] === "*") {
    return (Object.keys(PERMISSIONS) as Permission[]).filter((p) => p.startsWith("tenant."));
  }
  return list as Permission[];
}

export function canPlatform(
  role: PlatformRole | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  const list = platformMatrix[role];
  if (!list) return false;
  return list[0] === "*" || (list as Permission[]).includes(permission);
}

export function canTenant(
  role: TenantRole | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  const list = tenantMatrix[role];
  if (!list) return false;
  return list[0] === "*" || (list as Permission[]).includes(permission);
}

export function resolveWorkspace(
  platformRole: PlatformRole | null | undefined,
  tenantRole: TenantRole | null | undefined,
  tenantId: string | null | undefined,
): "platform" | "client" | "none" {
  // Platform Super Admin / staff always use the Super Admin workspace
  if (platformRole) return "platform";

  // School client workspace requires a tenant binding (never bare role alone)
  if (tenantId && tenantRole) return "client";

  // Unbound operators (no tenantId): Super Admin / bootstrap — NOT the school dashboard.
  // Fixes legacy profiles with role "admin" but no tenantId landing on empty school UI.
  if (!tenantId) {
    return "platform";
  }

  return "none";
}

export function homePathForWorkspace(workspace: "platform" | "client" | "none"): string {
  if (workspace === "platform") return "/super-admin";
  if (workspace === "client") return "/school";
  return "/";
}
