import { BaseDocument } from "@/types/base";

export interface ParentSubmissionRecord extends BaseDocument {
  learnerFirstName: string;
  learnerLastName: string;
  className: string;
  programme: string;
  instrumentOrActivity?: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContact?: string;
  message: string;
  status: "new" | "reviewed" | "converted" | "archived";
}

export type ParentSubmissionFormValues = Omit<
  ParentSubmissionRecord,
  "id" | "tenantId" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "status"
>;

export type FollowUpReason = "absence" | "unpaid_fees" | "missing_info" | "reminder" | "general_update";
export type FollowUpStatus = "pending" | "done" | "urgent";

export interface FollowUpRecord extends BaseDocument {
  submissionId?: string;
  learnerId?: string;
  learnerName: string;
  parentName: string;
  parentPhone: string;
  contactMethod?: "email" | "phone" | "whatsapp";
  notes?: string;
  message: string;
  reason: FollowUpReason;
  scheduledFor?: string;
  status: FollowUpStatus;
}

export type FollowUpFormValues = Omit<
  FollowUpRecord,
  "id" | "tenantId" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "status"
>;
