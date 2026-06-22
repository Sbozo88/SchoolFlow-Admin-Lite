import type { Role } from "@/lib/types";

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

export function normalizeRole(value: unknown): Role | null {
  return value === "admin" ? "admin" : null;
}
