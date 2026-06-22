import type { AttendanceRecord } from "@/types/attendance";
import { demoAttendance } from "@/utils/seedData";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";

export function useAttendance() {
  return useFirestoreCollection<AttendanceRecord>("attendance", demoAttendance, {
    orderByField: "lessonDate",
    orderDirection: "desc",
  });
}
