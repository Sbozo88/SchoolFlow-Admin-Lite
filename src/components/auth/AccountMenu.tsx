"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { BrandedLoading } from "@/components/ui/BrandedLoading";

export function AccountMenu() {
  const { user, role, logout, isConfigured } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isConfigured || !user) {
    return null;
  }

  async function handleLogout() {
    setIsSigningOut(true);
    try {
      await logout();
    } catch {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      {isSigningOut ? (
        <div className="fixed inset-0 z-[80]">
          <BrandedLoading fullScreen title="Signing you out" detail="Closing your SchoolFlow admin session." />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex min-w-0 items-center gap-2">
          <ShieldCheck className="shrink-0 text-teal-700" size={17} />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-slate-500">{role ?? "no admin role"}</p>
            <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900">{user.email}</p>
          </div>
        </div>
        <Button className="h-9 px-3" disabled={isSigningOut} onClick={handleLogout} type="button" variant="ghost">
          <LogOut size={15} /> Sign out
        </Button>
      </div>
    </>
  );
}
