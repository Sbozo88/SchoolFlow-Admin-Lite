import { generateTenantId, slugifyOrgName } from "@/lib/tenant/id";
import { stampTenantCreate, type TimestampProvider } from "@/lib/tenant/stamp";
import type { SubscriptionStatus, TenantStatus } from "@/lib/tenant/types";
import { DEFAULT_PLAN_ID, type PlanDefinition } from "@/lib/billing/plans";

export type ProvisionClientInput = {
  organizationName: string;
  adminEmail: string;
  adminDisplayName?: string;
  planId?: string;
  trialDays?: number;
  notes?: string;
  /** Firebase Auth uid if already created; otherwise a pending profile id is used. */
  adminUid?: string;
};

export type ProvisionResult = {
  tenantId: string;
  tenant: Record<string, unknown>;
  settings: Record<string, unknown>;
  roles: Record<string, unknown>[];
  adminProfile: Record<string, unknown>;
  subscription: Record<string, unknown>;
  invitation: Record<string, unknown>;
};

const DEFAULT_TENANT_ROLES = [
  { key: "client_admin", label: "Client Admin", permissions: ["*"] },
  { key: "manager", label: "Manager", permissions: ["tenant.*"] },
  { key: "dispatcher", label: "Dispatcher", permissions: ["tenant.attendance", "tenant.learners"] },
  { key: "finance", label: "Finance", permissions: ["tenant.payments", "tenant.reports"] },
  { key: "viewer", label: "Viewer", permissions: ["tenant.dashboard", "tenant.reports"] },
  { key: "driver", label: "Driver", permissions: ["tenant.dashboard"] },
];

/**
 * Pure provisioning builder: produces isolated documents for one tenant.
 * Does not touch other tenants. Callers persist with Firestore writeBatch.
 */
export function buildTenantProvision(
  input: ProvisionClientInput,
  actorUserId: string,
  timestamps: TimestampProvider,
  opts?: {
    generateId?: () => string;
    plans?: PlanDefinition[];
    nowDate?: () => Date;
  },
): ProvisionResult {
  const name = input.organizationName?.trim();
  if (!name) throw new Error("organizationName is required");
  const adminEmail = input.adminEmail?.trim().toLowerCase();
  if (!adminEmail || !adminEmail.includes("@")) throw new Error("valid adminEmail is required");
  if (!actorUserId?.trim()) throw new Error("actorUserId is required");

  const tenantId = (opts?.generateId ?? generateTenantId)();
  const planId = input.planId ?? DEFAULT_PLAN_ID;
  const trialDays = input.trialDays ?? 14;
  const nowDate = opts?.nowDate?.() ?? new Date();
  const trialEnds = new Date(nowDate.getTime() + trialDays * 86400000).toISOString();

  const ctx = { tenantId, userId: actorUserId };

  const tenant = stampTenantCreate(
    {
      name,
      slug: slugifyOrgName(name),
      status: "trial" as TenantStatus,
      planId,
      subscriptionStatus: "trial" as SubscriptionStatus,
      trialEndsAt: trialEnds,
      subscriptionExpiresAt: trialEnds,
      adminEmail,
      storageUsedBytes: 0,
      storageQuotaBytes: 5 * 1024 * 1024 * 1024,
      notes: input.notes ?? "",
    },
    ctx,
    timestamps,
  );

  const settings = stampTenantCreate(
    {
      organizationName: name,
      currency: "ZAR",
      timezone: "Africa/Johannesburg",
      programmes: ["Music", "Art", "Drama"],
      defaultMonthlyFee: 750,
      enrollmentFormEnabled: true,
    },
    ctx,
    timestamps,
  );

  const roles = DEFAULT_TENANT_ROLES.map((role) =>
    stampTenantCreate(
      {
        roleKey: role.key,
        label: role.label,
        permissions: role.permissions,
      },
      ctx,
      timestamps,
    ),
  );

  const adminUid = input.adminUid?.trim() || `pending-${tenantId}`;
  const adminProfile = stampTenantCreate(
    {
      email: adminEmail,
      displayName: input.adminDisplayName?.trim() || adminEmail.split("@")[0],
      role: "client_admin",
      platformRole: null,
      tenantId,
      status: input.adminUid ? "active" : "invited",
      subscriptionStatus: "trial",
      organizationName: name,
    },
    ctx,
    timestamps,
  );

  const subscription = stampTenantCreate(
    {
      planId,
      status: "trial" as SubscriptionStatus,
      trialEndsAt: trialEnds,
      renewsAt: trialEnds,
      paymentStatus: "trialing",
    },
    ctx,
    timestamps,
  );

  const invitation = stampTenantCreate(
    {
      email: adminEmail,
      role: "client_admin",
      status: "pending",
      // Future-ready: Cloud Function / Email Service sends this
      sendEmail: false,
      message: "Invitation queued (email delivery future-ready).",
    },
    ctx,
    timestamps,
  );

  return {
    tenantId,
    tenant: { id: tenantId, ...tenant },
    settings: { id: "main", ...settings },
    roles: roles.map((r, i) => ({ id: `${tenantId}-role-${DEFAULT_TENANT_ROLES[i].key}`, ...r })),
    adminProfile: { id: adminUid, ...adminProfile },
    subscription: { id: `${tenantId}-sub`, ...subscription },
    invitation: { id: `${tenantId}-invite`, ...invitation },
  };
}

/** Ensure two provision results never share a tenantId (test helper uses real generator). */
export function provisionProducesDistinctTenantIds(
  a: ProvisionResult,
  b: ProvisionResult,
): boolean {
  return Boolean(a.tenantId && b.tenantId && a.tenantId !== b.tenantId);
}
