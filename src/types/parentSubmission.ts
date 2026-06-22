export type ParentSubmissionStatus = "new" | "contacted" | "converted" | "closed";

export type ParentSubmission = {
  id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  learnerName: string;
  message?: string;
  status: ParentSubmissionStatus;
  submittedAt?: Date;
};
