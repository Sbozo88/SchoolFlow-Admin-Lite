"use client";

import { CalendarCheck } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, type TableColumn } from "@/components/ui/Table";
import { useAttendance } from "@/hooks/useAttendance";
import type { AttendanceRecord } from "@/types/attendance";
import { formatShortDate } from "@/utils/date";

const columns: TableColumn<AttendanceRecord>[] = [
  { key: "learner", header: "Learner", render: (record) => <span className="font-bold text-slate-950">{record.learnerName}</span> },
  { key: "date", header: "Date", render: (record) => formatShortDate(record.lessonDate) },
  {
    key: "status",
    header: "Status",
    render: (record) => <Badge tone={record.status === "present" ? "green" : record.status === "absent" ? "rose" : "amber"}>{record.status}</Badge>,
  },
  { key: "notes", header: "Notes", render: (record) => record.notes ?? "None" },
];

export function AttendancePage() {
  const { records: attendance, syncState } = useAttendance();

  return (
    <ProtectedRoute>
      <AdminLayout activeItem="Attendance">
        <PageHeader description={syncState} title="Attendance" />
        {attendance.length > 0 ? (
          <Table columns={columns} getRowKey={(record) => record.id} rows={attendance} />
        ) : (
          <EmptyState
            action={<CalendarCheck className="mx-auto text-teal-700" size={24} />}
            description="Attendance records will appear here after live Firestore data is connected."
            title="No attendance records"
          />
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default AttendancePage;
