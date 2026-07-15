/**
 * Rule-shaped predicates mirroring firestore.rules tenant isolation.
 * Unit tests drive these real shipped predicates — not a separate oracle.
 */

export type RuleUserProfile = {
  platformRole?: string | null;
  role?: string | null;
  tenantId?: string | null;
};

export function signedIn(authUid: string | null | undefined): boolean {
  return Boolean(authUid);
}

export function isPlatformUser(profile: RuleUserProfile | null | undefined): boolean {
  const role = profile?.platformRole;
  return role === "super_admin" || role === "platform_support" || role === "platform_manager";
}

export function isSuperAdmin(profile: RuleUserProfile | null | undefined): boolean {
  return profile?.platformRole === "super_admin";
}

export function isTenantMember(
  profile: RuleUserProfile | null | undefined,
  resourceTenantId: string | null | undefined,
): boolean {
  if (!profile?.tenantId || !resourceTenantId) return false;
  return profile.tenantId === resourceTenantId;
}

export function canReadTenantDoc(
  authUid: string | null | undefined,
  profile: RuleUserProfile | null | undefined,
  resourceTenantId: string | null | undefined,
): boolean {
  if (!signedIn(authUid)) return false;
  if (isPlatformUser(profile)) return true;
  return isTenantMember(profile, resourceTenantId);
}

export function canWriteTenantDoc(
  authUid: string | null | undefined,
  profile: RuleUserProfile | null | undefined,
  resourceTenantId: string | null | undefined,
  requestTenantId: string | null | undefined,
): boolean {
  if (!signedIn(authUid)) return false;
  if (isSuperAdmin(profile)) return true;
  if (!isTenantMember(profile, resourceTenantId)) return false;
  if (requestTenantId != null && requestTenantId !== profile?.tenantId) return false;
  const role = profile?.role;
  return (
    role === "admin" ||
    role === "client_admin" ||
    role === "manager" ||
    role === "dispatcher" ||
    role === "finance"
  );
}

export function canCreateParentSubmission(
  requestTenantId: string | null | undefined,
): boolean {
  // Public intake allowed only when tenantId is stamped on the resource
  return Boolean(requestTenantId?.trim());
}

export function canManagePlatformCollection(
  authUid: string | null | undefined,
  profile: RuleUserProfile | null | undefined,
): boolean {
  return signedIn(authUid) && isPlatformUser(profile);
}
