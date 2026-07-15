import type { TenantRole } from "@/lib/permissions/roles";

/** Legacy role alias used by ProtectedRoute defaults — maps to tenant admin. */
export type Role = "admin";

export type AdminUserProfile = {
  id: string;
  email?: string;
  displayName?: string;
  role?: Role | TenantRole;
  platformRole?: string | null;
  tenantId?: string | null;
};

export type { AttendanceRecord } from "@/features/attendance/types";
export type { Learner } from "@/features/learners/types";
export type { ParentSubmissionRecord as ParentSubmission } from "@/features/parents/types";
export type { PaymentRecord as Payment } from "@/features/payments/types";
export type { RecentActivity } from "@/types/activity";
