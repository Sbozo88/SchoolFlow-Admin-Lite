import { AdminHome } from "@/components/admin/AdminHome";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";

export function DashboardPage() {
  return (
    <ProtectedRoute>
      <AdminLayout activeItem="Dashboard">
        <AdminHome />
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default DashboardPage;
