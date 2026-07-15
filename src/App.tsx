import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
import { MockDataProvider } from "@/components/providers/MockDataProvider";
import { ImpersonationBanner } from "@/components/tenant/ImpersonationBanner";
import { BrandedLoading } from "@/components/ui/BrandedLoading";

const Home = lazy(() => import("@/routes/page"));
const Login = lazy(() => import("@/routes/login/page"));
const Enroll = lazy(() => import("@/routes/enroll/page"));
const ParentForm = lazy(() => import("@/routes/parent-form/page"));
const AdminHome = lazy(() => import("@/routes/admin/page"));
const Learners = lazy(() => import("@/routes/admin/learners/page"));
const Attendance = lazy(() => import("@/routes/admin/attendance/page"));
const Payments = lazy(() => import("@/routes/admin/payments/page"));
const FollowUps = lazy(() => import("@/routes/admin/parent-follow-ups/page"));
const ParentSubmissions = lazy(() => import("@/routes/admin/parent-form/page"));
const Reports = lazy(() => import("@/routes/admin/reports/page"));
const Settings = lazy(() => import("@/routes/admin/settings/page"));
const SetupSprint = lazy(() => import("@/routes/admin/setup-sprint/page"));
const Handover = lazy(() => import("@/routes/admin/handover/page"));
const MonthlySupport = lazy(() => import("@/routes/admin/monthly-support/page"));
const PlatformHome = lazy(() => import("@/routes/super-admin/page"));
const Clients = lazy(() => import("@/routes/super-admin/clients/page"));
const ClientMonitor = lazy(() => import("@/routes/super-admin/clients/monitor/page"));
const Users = lazy(() => import("@/routes/super-admin/users/page"));
const Billing = lazy(() => import("@/routes/super-admin/billing/page"));
const Support = lazy(() => import("@/routes/super-admin/support/page"));
const Audit = lazy(() => import("@/routes/super-admin/audit/page"));

function AdminWorkspace() {
  return (
    <ProtectedRoute workspace="client">
      <MockDataProvider>
        <AdminLayout>
          <ImpersonationBanner />
          <Outlet />
        </AdminLayout>
      </MockDataProvider>
    </ProtectedRoute>
  );
}

function PlatformWorkspace() {
  return (
    <ProtectedRoute workspace="platform">
      <SuperAdminLayout><Outlet /></SuperAdminLayout>
    </ProtectedRoute>
  );
}

export function App() {
  return (
    <Suspense fallback={<BrandedLoading fullScreen title="Loading SchoolFlow Admin Lite" detail="Preparing your workspace." />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/parent-form" element={<ParentForm />} />
        <Route path="/admin" element={<AdminWorkspace />}>
          <Route index element={<AdminHome />} />
          <Route path="learners" element={<Learners />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payments" element={<Payments />} />
          <Route path="parent-follow-ups" element={<FollowUps />} />
          <Route path="parent-form" element={<ParentSubmissions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="setup-sprint" element={<SetupSprint />} />
          <Route path="handover" element={<Handover />} />
          <Route path="monthly-support" element={<MonthlySupport />} />
        </Route>
        <Route path="/super-admin" element={<PlatformWorkspace />}>
          <Route index element={<PlatformHome />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/monitor" element={<ClientMonitor />} />
          <Route path="users" element={<Users />} />
          <Route path="billing" element={<Billing />} />
          <Route path="support" element={<Support />} />
          <Route path="audit" element={<Audit />} />
        </Route>
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Suspense>
  );
}
