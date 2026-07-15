/** Shared multi-tenant document metadata required on business records. */
export type TenantDocumentMeta = {
  tenantId: string;
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
};

export type TenantStatus = "active" | "suspended" | "archived" | "trial";

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export type TenantRecord = TenantDocumentMeta & {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  planId: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: string | null;
  subscriptionExpiresAt?: string | null;
  adminEmail: string;
  storageUsedBytes: number;
  storageQuotaBytes: number;
  notes?: string;
};

export type TenantWriteContext = {
  tenantId: string;
  userId: string;
};

export type ImpersonationMode = "read" | "support";

export type ImpersonationSession = {
  tenantId: string;
  mode: ImpersonationMode;
  startedAt: string;
  startedBy: string;
  expiresAt: string;
};
