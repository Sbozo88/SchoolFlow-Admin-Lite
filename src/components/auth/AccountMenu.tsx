"use client";

import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandedLoading } from "@/components/ui/BrandedLoading";

export function AccountMenu({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const { user, role, platformRole, tenantRole, profile, logout, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isConfigured || !user) {
    return null;
  }

  const displayRole =
    platformRole?.replace(/_/g, " ") ||
    tenantRole?.replace(/_/g, " ") ||
    role ||
    "Admin";
  const displayName =
    profile?.displayName ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "User";
  const email = profile?.email || user.email || "";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    setIsSigningOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
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
        className={`flex items-center gap-2.5 ${
          compact
            ? "rounded-full border border-slate-100 bg-white py-1.5 pl-1.5 pr-2 shadow-sm"
            : "rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
        } ${className}`}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a29bfe] to-[#6c5ce7] text-[12px] font-bold text-white shadow-sm ring-2 ring-[#6c5ce7]/15">
          {initials || "SF"}
        </div>
        <div className="min-w-0 hidden sm:block">
          <p className="max-w-[140px] truncate text-[13px] font-bold leading-tight text-slate-900">
            {displayName}
          </p>
          <p className="max-w-[160px] truncate text-[11px] font-medium capitalize leading-tight text-[#6c5ce7]">
            {displayRole}
            {email ? ` · ${email}` : ""}
          </p>
        </div>
        <button
          type="button"
          disabled={isSigningOut}
          onClick={handleLogout}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-bold text-slate-500 transition-colors hover:bg-[#eee9ff] hover:text-[#6c5ce7] disabled:opacity-50"
        >
          <LogOut size={14} />
          <span className="hidden md:inline">Sign out</span>
        </button>
      </div>
    </>
  );
}
