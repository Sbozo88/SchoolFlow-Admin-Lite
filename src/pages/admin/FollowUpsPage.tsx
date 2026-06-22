import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export function FollowUpsPage() {
  return (
    <ProtectedRoute>
      <AdminLayout activeItem="Follow-ups">
        <PageHeader description="Parent and learner follow-up workflows belong here once the data contract is confirmed." title="Follow-ups" />
        <EmptyState description="No follow-up queue has been connected yet." title="No follow-ups" />
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default FollowUpsPage;
