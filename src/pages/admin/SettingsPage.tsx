import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export function SettingsPage() {
  return (
    <ProtectedRoute>
      <AdminLayout activeItem="Settings">
        <PageHeader description="Admin settings should stay backed by Firestore rules and explicit role checks." title="Settings" />
        <EmptyState description="No settings form has been connected yet." title="Settings not configured" />
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default SettingsPage;
