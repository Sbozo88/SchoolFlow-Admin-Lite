"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { BrandedLoading } from "@/components/ui/BrandedLoading";

export function AccountMenu({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const { user, role, platformRole, tenantRole, profile, logout, isConfigured } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isConfigured || !user) {
    return null;
  }

  const displayRole =
    platformRole?.replace(/_/g, " ") ||
    tenantRole?.replace(/_/g, " ") ||
    role ||
    "signed in";
  const displayName =
    profile?.displayName ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "User";
  const email = profile?.email || user.email || "";

  async function handleLogout() {
    setIsSigningOut(true);
    try {
      await logout();
      router.replace("/login");
    } catch {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      {isSigningOut ? (
        <div className="fixed inset-0 z-[80]">
          <BrandedLoading
            fullScreen
            title="Signing you out"
            detail="Closing your SchoolFlow Admin Lite session."
          />
        </div>
      ) : null}
      <div
        className={`flex flex-wrap items-center gap-2 ${
          compact
            ? "rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-1.5"
            : "rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
        } ${className}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#6c5ce7]/10 text-[#6c5ce7]">
            <ShieldCheck size={16} />
          </div>
          <div className="min-w-0">
            <p className="max-w-[160px] truncate text-[13px] font-bold text-slate-900">{displayName}</p>
            <p className="max-w-[180px] truncate text-[11px] font-medium capitalize text-[#6c5ce7]">
              {displayRole}
              {email ? ` · ${email}` : ""}
            </p>
          </div>
        </div>
        <Button
          className="h-9 shrink-0 px-3"
          disabled={isSigningOut}
          onClick={handleLogout}
          type="button"
          variant="ghost"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </>
  );
}
