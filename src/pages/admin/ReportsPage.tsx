import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export function ReportsPage() {
  return (
    <ProtectedRoute>
      <AdminLayout activeItem="Reports">
        <PageHeader description="Reporting can build on the shared Firestore hooks without bypassing admin RBAC." title="Reports" />
        <EmptyState description="No reports have been connected yet." title="No reports" />
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default ReportsPage;
