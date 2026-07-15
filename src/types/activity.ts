export type ActivityType = 
  | "learner_added" 
  | "attendance_marked" 
  | "payment_updated" 
  | "follow_up_created" 
  | "parent_form_submitted" 
  | "report_generated";

export type RecentActivity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  link?: string;
  timestamp: string;
};
