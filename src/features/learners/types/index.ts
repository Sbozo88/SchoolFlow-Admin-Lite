import { BaseDocument } from "@/types/base";

export interface Learner extends BaseDocument {
  firstName: string;
  lastName: string;
  className: string;
  programme: string;
  instrumentOrActivity: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  paymentStatus: "paid" | "unpaid" | "partial" | "overdue";
  learnerStatus: "active" | "inactive" | "pending" | "archived";
  notes?: string;
}

export type LearnerFormValues = Omit<
  Learner,
  "id" | "tenantId" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "status"
>;
