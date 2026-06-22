export type FollowUpReason = 
  | "absence"
  | "unpaid_fees"
  | "missing_info"
  | "behaviour"
  | "reminder"
  | "general_update";

export type FollowUpStatus = "pending" | "done" | "urgent";

export type FollowUp = {
  id: string;
  learnerId: string;
  learnerName: string;
  parentName: string;
  parentPhone: string;
  reason: FollowUpReason;
  status: FollowUpStatus;
  message: string;
  notes?: string;
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
};
