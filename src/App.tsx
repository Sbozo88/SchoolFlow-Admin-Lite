import { lazy, Suspense } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DemoLayout } from "@/components/layout/DemoLayout";
import { SchoolLayout } from "@/components/layout/SchoolLayout";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
import { MockDataProvider } from "@/components/providers/MockDataProvider";
import { ImpersonationBanner } from "@/components/tenant/ImpersonationBanner";
import { BrandedLoading } from "@/components/ui/BrandedLoading";

const Home = lazy(() => import("@/routes/page"));
const NotFound = lazy(() => import("@/routes/not-found/page"));
const Login = lazy(() => import("@/routes/login/page"));
const Enroll = lazy(() => import("@/routes/enroll/page"));
const ParentForm = lazy(() => import("@/routes/parent-form/page"));
const SchoolHome = lazy(() => import("@/routes/school/page"));
const Learners = lazy(() => import("@/routes/school/learners/page"));
const Attendance = lazy(() => import("@/routes/school/attendance/page"));
const Payments = lazy(() => import("@/routes/school/payments/page"));
const FollowUps = lazy(() => import("@/routes/school/parent-follow-ups/page"));
const ParentSubmissions = lazy(() => import("@/routes/school/parent-form/page"));
const Reports = lazy(() => import("@/routes/school/reports/page"));
const Settings = lazy(() => import("@/routes/school/settings/page"));
const SetupSprint = lazy(() => import("@/routes/school/setup-sprint/page"));
const Handover = lazy(() => import("@/routes/school/handover/page"));
const MonthlySupport = lazy(() => import("@/routes/school/monthly-support/page"));
const PlatformHome = lazy(() => import("@/routes/super-admin/page"));
const Clients = lazy(() => import("@/routes/super-admin/clients/page"));
const ClientMonitor = lazy(() => import("@/routes/super-admin/clients/monitor/page"));
const Users = lazy(() => import("@/routes/super-admin/users/page"));
const Billing = lazy(() => import("@/routes/super-admin/billing/page"));
const Support = lazy(() => import("@/routes/super-admin/support/page"));
const Audit = lazy(() => import("@/routes/super-admin/audit/page"));

function SchoolWorkspace() {
  return (
    <ProtectedRoute workspace="client">
      <MockDataProvider>
        <SchoolLayout>
          <ImpersonationBanner />
          <Outlet />
        </SchoolLayout>
      </MockDataProvider>
    </ProtectedRoute>
  );
}

function DemoWorkspace() {
  return (
    <ProtectedRoute workspace="client">
      <MockDataProvider>
        <DemoLayout>
          <ImpersonationBanner />
          <Outlet />
        </DemoLayout>
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
        <Route path="/school" element={<SchoolWorkspace />}>
          <Route index element={<SchoolHome />} />
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
        <Route path="/demo" element={<DemoWorkspace />}>
          <Route index element={<SchoolHome />} />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
