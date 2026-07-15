"use client";

import { LockKeyhole, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { Button } from "@/components/ui/Button";
import { BrandedLoading } from "@/components/ui/BrandedLoading";
import type { PlatformRole } from "@/lib/permissions/roles";
import {
  canStayOnClientWorkspace,
  shouldRedirectPlatformUserFromAdmin,
} from "@/lib/permissions/workspaceAccess";

export function ProtectedRoute({
  children,
  workspace = "client",
  allowedPlatformRoles,
}: {
  children: ReactNode;
  /** client = school-ops /admin; platform = super-admin portal */
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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && isConfigured && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname ?? homePath)}`);
    }
  }, [homePath, isConfigured, loading, pathname, router, user]);

  // Redirect pure platform users away from client workspace UNLESS impersonating a tenant
  useEffect(() => {
    if (loading || !user) return;
    if (
      workspace === "client" &&
      pathname?.startsWith("/admin") &&
      shouldRedirectPlatformUserFromAdmin({
        platformRole,
        homeTenantId: tenantId,
        tenantRole,
        isImpersonating,
      })
    ) {
      router.replace("/super-admin");
    }
    if (workspace === "platform" && !platformRole && (role || tenantRole)) {
      router.replace("/admin");
    }
  }, [
    isImpersonating,
    loading,
    platformRole,
    role,
    router,
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
    const allowed = allowedPlatformRoles ?? ["super_admin", "platform_support", "platform_manager"];
    if (!platformRole || !allowed.includes(platformRole)) {
      return (
        <AccessShell
          action={
            <Button onClick={logout} type="button" variant="secondary">
              Sign out
            </Button>
          }
          detail={
            authError ||
            "Platform access required. Your account is not a Super Admin or platform staff user."
          }
          icon={<ShieldAlert size={24} />}
          title="Platform access required"
        />
      );
    }
    return children;
  }

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
          detail="Opening Super Admin workspace."
          fullScreen
          title="Redirecting"
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
          "Your account is signed in, but it does not have access to this client workspace."
        }
        icon={<ShieldAlert size={24} />}
        title="Admin access required"
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
              href="/login"
            >
              Go to login
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
