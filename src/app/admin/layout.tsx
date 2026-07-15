import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MockDataProvider } from "@/components/providers/MockDataProvider";
import { ImpersonationBanner } from "@/components/tenant/ImpersonationBanner";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute workspace="client">
      {/* MockDataProvider retained only for residual mock-only pages (e.g. handover). Primary modules use live hooks. */}
      <MockDataProvider>
        <AdminLayout>
          <ImpersonationBanner />
          {children}
        </AdminLayout>
      </MockDataProvider>
    </ProtectedRoute>
  );
}
