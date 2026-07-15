"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  ScrollText,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { BrandedLoading } from "@/components/ui/BrandedLoading";

const nav = [
  { href: "/super-admin", label: "Platform", icon: LayoutDashboard },
  { href: "/super-admin/clients", label: "Clients", icon: Building2 },
  { href: "/super-admin/users", label: "Users", icon: Users },
  { href: "/super-admin/billing", label: "Billing", icon: CreditCard },
  { href: "/super-admin/support", label: "Support", icon: LifeBuoy },
  { href: "/super-admin/audit", label: "Audit", icon: ScrollText },
];

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile, logout, platformRole } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {isSigningOut ? (
        <div className="fixed inset-0 z-[80]">
          <BrandedLoading
            fullScreen
            title="Signing you out"
            detail="Closing your platform session."
          />
        </div>
      ) : null}
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-slate-950 text-white md:flex">
        <div className="px-5 py-6">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-400">SchoolFlow</p>
          <h1 className="mt-1 text-lg font-black">Super Admin</h1>
          <p className="mt-1 text-[11px] text-slate-400">{platformRole ?? "platform"}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/super-admin"
                ? pathname === "/super-admin" || pathname === "/super-admin/"
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  active ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-xs text-slate-400">{profile?.email}</p>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isSigningOut}
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white disabled:opacity-50"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 md:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto md:hidden">
            {nav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="whitespace-nowrap text-xs font-bold text-slate-600"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="hidden text-sm font-semibold text-slate-600 md:block">Platform management</p>
          <div className="flex shrink-0 items-center gap-2">
            <AccountMenu compact />
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isSigningOut}
              className="md:hidden flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-bold text-slate-700"
            >
              <LogOut size={14} /> Out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
