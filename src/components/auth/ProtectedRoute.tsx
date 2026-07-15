"use client";

import { LockKeyhole, ShieldAlert } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { Button } from "@/components/ui/Button";
import { BrandedLoading } from "@/components/ui/BrandedLoading";
import type { PlatformRole } from "@/lib/permissions/roles";
import {
  canAccessPlatformWorkspace,
  canStayOnClientWorkspace,
  shouldRedirectPlatformUserFromAdmin,
} from "@/lib/permissions/workspaceAccess";

export function ProtectedRoute({
  children,
  workspace = "client",
  allowedPlatformRoles,
}: {
  children: ReactNode;
  /** client = school-ops /school; platform = super-admin portal */
  workspace?: "client" | "platform";
  allowedPlatformRoles?: PlatformRole[];
}) {
  const {
    user,
    role,
    platformRole,
    tenantRole,
    tenantId,
    loading,
    authError,
    logout,
    isConfigured,
    homePath,
  } = useAuth();
  const tenant = useOptionalTenant();
  const isImpersonating = Boolean(tenant?.isImpersonating && tenant.activeTenantId);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!loading && isConfigured && !user) {
      navigate(`/login?next=${encodeURIComponent(pathname || homePath)}`, { replace: true });
    }
  }, [homePath, isConfigured, loading, navigate, pathname, user]);

  // Super Admin / unbound operators must never stay on the school dashboard
  useEffect(() => {
    if (loading || !user) return;
    if (
      workspace === "client" &&
      (pathname?.startsWith("/school") || pathname?.startsWith("/demo")) &&
      shouldRedirectPlatformUserFromAdmin({
        platformRole,
        homeTenantId: tenantId,
        tenantRole,
        isImpersonating,
      })
    ) {
      navigate("/super-admin", { replace: true });
    }
    // School-only users (tenant bound, no platform role) cannot open Super Admin
    if (
      workspace === "platform" &&
      !canAccessPlatformWorkspace({
        platformRole,
        homeTenantId: tenantId,
        tenantRole,
      })
    ) {
      navigate("/school", { replace: true });
    }
  }, [
    isImpersonating,
    loading,
    platformRole,
    role,
    navigate,
    tenantId,
    tenantRole,
    user,
    workspace,
    pathname,
  ]);

  if (!isConfigured) {
    return (
      <AccessShell
        detail="Add Firebase web app credentials to .env.local to enable secure login and role checks."
        title="Firebase auth is not configured"
      />
    );
  }

  if (loading || !user) {
    return (
      <BrandedLoading
        detail="Checking your secure Firebase session."
        fullScreen
        title="Loading SchoolFlow Admin Lite"
      />
    );
  }

  if (workspace === "platform") {
    const allowed =
      allowedPlatformRoles ?? (["super_admin", "platform_support", "platform_manager"] as PlatformRole[]);
    const roleAllowed = !platformRole || allowed.includes(platformRole);
    const access = canAccessPlatformWorkspace({
      platformRole,
      homeTenantId: tenantId,
      tenantRole,
    });

    if (!access || !roleAllowed) {
      // School-only tenant users
      if (tenantId) {
        return (
          <AccessShell
            action={
              <Button onClick={logout} type="button" variant="secondary">
                Sign out
              </Button>
            }
            detail="This Super Admin portal is for platform operators. Your account is bound to a school tenant."
            icon={<ShieldAlert size={24} />}
            title="Platform access required"
          />
        );
      }
    }

    // Unbound users may enter to bootstrap even without platformRole yet
    if (access) {
      return children;
    }

    return (
      <AccessShell
        action={
          <Button onClick={logout} type="button" variant="secondary">
            Sign out
          </Button>
        }
        detail={authError || "Platform access required."}
        icon={<ShieldAlert size={24} />}
        title="Platform access required"
      />
    );
  }

  // School client workspace
  const hasClientAccess = canStayOnClientWorkspace({
    role,
    platformRole,
    tenantRole,
    homeTenantId: tenantId,
    isImpersonating,
  });

  if (!hasClientAccess) {
    if (
      shouldRedirectPlatformUserFromAdmin({
        platformRole,
        homeTenantId: tenantId,
        tenantRole,
        isImpersonating,
      })
    ) {
      return (
        <BrandedLoading
          detail="Opening Super Admin workspace (school dashboard is for client schools only)."
          fullScreen
          title="Redirecting to Super Admin"
        />
      );
    }
    return (
      <AccessShell
        action={
          <Button onClick={logout} type="button" variant="secondary">
            Sign out
          </Button>
        }
        detail={
          authError ||
          "Your account is not linked to a school tenant. Super Admins should use /super-admin."
        }
        icon={<ShieldAlert size={24} />}
        title="School access required"
      />
    );
  }

  return children;
}

function AccessShell({
  title,
  detail,
  icon,
  action,
}: {
  title: string;
  detail: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          {icon ?? <LockKeyhole size={24} />}
        </div>
        <h1 className="text-xl font-black text-slate-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
        <div className="mt-5 flex justify-center gap-3">
          {action ?? (
            <Link
              className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-bold text-white"
              to="/login"
            >
              Go to login
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
