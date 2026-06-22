export type SupportCheckStatus = "not_started" | "in_progress" | "complete";

export type SupportCheck = {
  id: string;
  month: string;
  attendanceReviewed: boolean;
  paymentsReviewed: boolean;
  followUpsReviewed: boolean;
  missingInfoReviewed: boolean;
  reportsUpdated: boolean;
  recommendations?: string;
  status: SupportCheckStatus;
  createdAt: Date;
  updatedAt: Date;
};
