export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type AttendanceRecord = {
  id: string;
  learnerId: string;
  learnerName: string;
  date: string;
  status: AttendanceStatus;
  className?: string;
  programme?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};
