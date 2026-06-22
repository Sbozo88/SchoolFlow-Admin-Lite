export type SetupSprintTaskStatus = "not_started" | "in_progress" | "done" | "blocked";

export type SetupSprintTask = {
  id: string;
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  description?: string;
  status: SetupSprintTaskStatus;
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type MissingInfoCategory = 
  | "learner_details"
  | "parent_contact"
  | "payment_record"
  | "attendance_record"
  | "class_programme"
  | "duplicate_record"
  | "other";

export type MissingInfoStatus = "open" | "requested" | "resolved" | "ignored";
export type MissingInfoPriority = "low" | "medium" | "high";

export type MissingInfoItem = {
  id: string;
  learnerId?: string;
  learnerName?: string;
  category: MissingInfoCategory;
  description: string;
  status: MissingInfoStatus;
  priority: MissingInfoPriority;
  createdAt: Date;
  updatedAt: Date;
};
