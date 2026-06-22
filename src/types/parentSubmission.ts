export type ParentSubmissionStatus = "new" | "reviewed" | "converted" | "archived";

export type ParentSubmission = {
  id: string;
  learnerFirstName: string;
  learnerLastName: string;
  className: string;
  programme: string;
  instrumentOrActivity?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  emergencyContact?: string;
  message?: string;
  status: ParentSubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
};
