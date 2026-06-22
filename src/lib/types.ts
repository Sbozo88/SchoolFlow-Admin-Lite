export type Role = "admin";

export type AdminUserProfile = {
  id: string;
  email?: string;
  displayName?: string;
  role?: Role;
};

export type { AttendanceRecord } from "@/types/attendance";
export type { Learner } from "@/types/learner";
export type { ParentSubmission } from "@/types/parentSubmission";
export type { PaymentRecord as Payment } from "@/types/payment";
export type { RecentActivity } from "@/types/activity";
