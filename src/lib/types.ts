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
export type { Payment } from "@/types/payment";
