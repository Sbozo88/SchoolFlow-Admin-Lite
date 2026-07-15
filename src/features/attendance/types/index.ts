import { BaseDocument } from "@/types/base";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord extends BaseDocument {
  learnerId: string;
  learnerName: string;
  className: string;
  programme?: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export type AttendanceFormValues = Omit<
  AttendanceRecord,
  "id" | "tenantId" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
>;
