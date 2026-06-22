import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
