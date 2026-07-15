import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";

export default function SuperAdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute workspace="platform">
      <SuperAdminLayout>{children}</SuperAdminLayout>
    </ProtectedRoute>
  );
}
