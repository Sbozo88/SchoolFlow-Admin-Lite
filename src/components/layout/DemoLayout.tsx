"use client";

import { useState } from "react";
import { Bell, Menu, Search, Shield, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  SCHOOL_PRIMARY_NAV,
  SCHOOL_SUPPORT_NAV,
} from "@/components/admin/dashboardPresentation";

export function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const { profile, user, platformRole } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  let activeItem = "Dashboard";
  const allNavItems = [...SCHOOL_PRIMARY_NAV, ...SCHOOL_SUPPORT_NAV];
  const matchedNav = allNavItems.slice().reverse().find((item) => {
    // Modify item.href to use /demo for the demo layout navigation
    const demoHref = item.href.replace("/school", "/demo");
    if (demoHref === "/demo") return pathname === "/demo" || pathname === "/demo/";
    return pathname?.startsWith(demoHref);
  });
  if (matchedNav) {
    activeItem = matchedNav.label;
  }

  const welcomeName =
    profile?.displayName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-[#eef0f7] text-slate-900 font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Purple gradient sidebar — reference fidelity */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[268px] transform flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "linear-gradient(180deg, #7c6cf0 0%, #5b4bdb 45%, #4834d4 100%)" }}
      >
        <div className="flex h-[76px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white/20 p-2 shadow-inner backdrop-blur-sm ring-1 ring-white/20">
              <img
                src="/images/logo.png"
                alt="SchoolFlow Logo"
                width={22}
                height={22}
                className="object-contain brightness-0 invert"
              />
            </div>
            <h1 className="text-[17px] font-bold tracking-tight text-white">
              SchoolFlow <span className="font-medium text-white/55">Lite</span>
            </h1>
          </div>
          <button
            type="button"
            className="text-white/70 hover:text-white md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
          <div className="grid gap-1">
            {SCHOOL_PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === activeItem;
              return (
                <Link
                  key={item.label}
                  to={item.href.replace("/school", "/demo")}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`group relative flex items-center gap-3.5 rounded-2xl px-4 py-3 text-[14px] transition-all ${
                    isActive
                      ? "bg-white/20 font-bold text-white shadow-sm backdrop-blur-sm"
                      : "font-medium text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-white" : "text-white/45 group-hover:text-white/80"}
                  />
                  {item.label}
                  {isActive && (
                    <span className="absolute -right-3 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-l-full bg-white shadow-sm" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 px-1">
            <div className="mx-3 mb-3 h-px bg-white/15" />
            <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
              Support
            </p>
            <div className="grid gap-1">
              {SCHOOL_SUPPORT_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = item.label === activeItem;
                return (
                  <Link
                    key={item.label}
                    to={item.href.replace("/school", "/demo")}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-[14px] transition-all ${
                      isActive
                        ? "bg-white/20 font-bold text-white"
                        : "font-medium text-white/65 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? "text-white" : "text-white/45 group-hover:text-white/80"}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 pt-0">
          <div className="rounded-2xl bg-white/12 p-4 shadow-inner ring-1 ring-white/10 backdrop-blur-sm">
            <p className="mb-1 text-[13px] font-bold text-white">SchoolFlow Pro</p>
            <p className="mb-3 text-[11px] leading-snug text-white/60">
              Upgrade for advanced analytics &amp; reporting
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-[#feca57] via-[#ff9f43] to-[#ff6b81]" />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-[76px] items-center justify-between gap-4 border-b border-white/60 bg-white/90 px-5 shadow-[0_2px_16px_rgba(108,92,231,0.06)] backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
            <button
              type="button"
              className="text-slate-500 transition-colors hover:text-[#6c5ce7] md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="min-w-0 shrink-0">
              <h2 className="hidden text-[20px] font-bold tracking-tight text-slate-900 sm:block">
                {activeItem}
              </h2>
              <p className="hidden text-[12px] font-medium text-slate-400 sm:block">
                Welcome back, {welcomeName}
              </p>
            </div>
            <div className="relative mx-auto hidden max-w-md flex-1 md:flex">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6c5ce7]/45" size={18} />
              <input
                type="search"
                placeholder="Search anything..."
                className="h-11 w-full rounded-full border border-transparent bg-[#f0f2f8] py-2.5 pl-11 pr-4 text-[13px] font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#6c5ce7]/20 focus:bg-[#eee9ff] focus:ring-4 focus:ring-[#6c5ce7]/10"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {platformRole ? (
              <Link
                to="/super-admin"
                className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-3 py-2 text-[12px] font-bold text-white hover:bg-slate-800 sm:inline-flex"
              >
                <Shield size={14} /> Super Admin
              </Link>
            ) : null}
            <button
              type="button"
              className="relative rounded-2xl p-2.5 text-slate-500 transition-colors hover:bg-[#eee9ff] hover:text-[#6c5ce7]"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-[#ff6b81] text-[9px] font-bold text-white shadow-sm">
                6
              </span>
            </button>
            <div className="hidden h-9 w-px bg-slate-200 sm:block" />
            <AccountMenu compact />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#eef0f7] px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-[1400px]">{children}</div>
          {/* Read-Only Demo Floating Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <Link
              to="/enroll"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] px-6 py-3 font-bold text-white shadow-lg shadow-[#6c5ce7]/30 transition-transform hover:scale-105"
            >
              Request Your Own School
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
