"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, type TableColumn } from "@/components/ui/Table";
import { usePayments } from "@/hooks/usePayments";
import type { Payment } from "@/types/payment";
import { formatShortDate } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

const columns: TableColumn<Payment>[] = [
  { key: "learner", header: "Learner", render: (payment) => <span className="font-bold text-slate-950">{payment.learnerName}</span> },
  { key: "parent", header: "Parent", render: (payment) => payment.parentName },
  { key: "amount", header: "Amount", render: (payment) => formatCurrency(payment.amount) },
  { key: "due", header: "Due", render: (payment) => formatShortDate(payment.dueDate) },
  {
    key: "status",
    header: "Status",
    render: (payment) => <Badge tone={payment.status === "paid" ? "green" : payment.status === "overdue" ? "rose" : "amber"}>{payment.status}</Badge>,
  },
];

export function PaymentsPage() {
  const { records: payments, syncState } = usePayments();

  return (
    <ProtectedRoute>
      <AdminLayout activeItem="Payments">
        <PageHeader description={syncState} title="Payments" />
        {payments.length > 0 ? (
          <Table columns={columns} getRowKey={(payment) => payment.id} rows={payments} />
        ) : (
          <EmptyState description="Payment records will appear here after live Firestore data is connected." title="No payments found" />
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default PaymentsPage;
