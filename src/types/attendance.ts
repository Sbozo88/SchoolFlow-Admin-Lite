import type { Timestamp } from "firebase/firestore";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type AttendanceRecord = {
  id: string;
  learnerId: string;
  learnerName: string;
  lessonDate: Timestamp | Date;
  status: AttendanceStatus;
  notes?: string;
};
