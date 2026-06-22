"use client";

import { Loader2, LockKeyhole, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import type { Role } from "@/lib/types";

export function ProtectedRoute({
  children,
  allowedRoles = ["admin"],
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) {
  const { user, role, loading, authError, logout, isConfigured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && isConfigured && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname ?? "/admin")}`);
    }
  }, [isConfigured, loading, pathname, router, user]);

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
      <AccessShell
        detail="Checking your secure Firebase session."
        icon={<Loader2 className="animate-spin" size={24} />}
        title="Loading SchoolFlow Admin LITE"
      />
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <AccessShell
        action={
          <Button onClick={logout} type="button" variant="secondary">
            Sign out
          </Button>
        }
        detail={authError || "Your account is signed in, but it does not have the admin role required for this workspace."}
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
            <Link className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-bold text-white" href="/login">
              Go to login
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
