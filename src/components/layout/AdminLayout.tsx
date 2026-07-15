"use client";

import { useState } from "react";
import {
  BarChart3,
  CreditCard,
  FileText,
  Settings,
  Users,
  Activity,
  Search,
  Bell,
  Menu,
  X,
  ClipboardList,
  CheckSquare,
  LifeBuoy,
  PhoneForwarded,
  LayoutDashboard
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { useAuth } from "@/components/auth/AuthProvider";

const primaryNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Learners", href: "/admin/learners", icon: Users },
  { label: "Attendance", href: "/admin/attendance", icon: CheckSquare },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Parent Follow-Ups", href: "/admin/parent-follow-ups", icon: PhoneForwarded },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Parent Form", href: "/admin/parent-form", icon: ClipboardList },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const secondaryNavItems = [
  { label: "Setup Sprint", href: "/admin/setup-sprint", icon: Activity },
  { label: "Handover", href: "/admin/handover", icon: FileText },
  { label: "Monthly Support", href: "/admin/monthly-support", icon: LifeBuoy },
];

export function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine active item based on pathname
  let activeItem = "Dashboard";
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];
  const matchedNav = allNavItems.slice().reverse().find((item) => {
    if (item.href === "/admin") return pathname === "/admin" || pathname === "/admin/";
    return pathname?.startsWith(item.href);
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
    <div className="flex h-screen overflow-hidden bg-[#f0f2f8] text-slate-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Purple gradient */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-[260px] transform flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: 'linear-gradient(180deg, #6c5ce7 0%, #4834d4 100%)' }}
      >
        {/* Logo Area */}
        <div className="flex h-20 items-center justify-between px-7">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 p-1.5 backdrop-blur-sm shadow-sm">
              <Image
                src="/images/logo.png"
                alt="SchoolFlow Logo"
                width={22}
                height={22}
                className="object-contain brightness-0 invert"
              />
            </div>
            <h1 className="text-[17px] font-bold tracking-tight text-white">
              SchoolFlow <span className="font-medium text-white/60">Lite</span>
            </h1>
          </div>
          <button className="md:hidden text-white/70 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="grid gap-1 px-4">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === activeItem;

              return (
                <Link
                  className={`group relative flex items-center gap-4 rounded-xl px-4 py-3 text-[14px] transition-all ${
                    isActive
                      ? "font-bold text-white bg-white/20 backdrop-blur-sm shadow-sm"
                      : "font-medium text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  href={item.href}
                  key={item.label}
                >
                  <Icon size={18} className={isActive ? "text-white" : "text-white/50 group-hover:text-white/80"} />
                  {item.label}
                  {isActive && (
                    <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-[5px] h-8 bg-white rounded-l-full shadow-sm" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-10 px-4">
            <div className="h-px bg-white/15 mb-4 mx-2" />
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-4 mb-3">Support</p>
            <div className="grid gap-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.label === activeItem;

                return (
                  <Link
                    className={`group relative flex items-center gap-4 rounded-xl px-4 py-3 text-[14px] transition-all ${
                      isActive
                        ? "font-bold text-white bg-white/20 backdrop-blur-sm"
                        : "font-medium text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                    href={item.href}
                    key={item.label}
                  >
                    <Icon size={18} className={isActive ? "text-white" : "text-white/50 group-hover:text-white/80"} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Sidebar footer decorative element */}
        <div className="p-4">
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
            <p className="text-[13px] font-bold text-white mb-1">SchoolFlow Pro</p>
            <p className="text-[11px] text-white/60 mb-3">Upgrade for advanced analytics & reporting</p>
            <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-[#feca57] to-[#ff6b81]" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between bg-white px-8 z-10 shadow-[0_2px_12px_rgba(108,92,231,0.04)]">
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              className="md:hidden text-slate-500 hover:text-[#6c5ce7] transition-colors" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 hidden sm:block">{activeItem}</h2>
              <p className="text-[12px] text-slate-400 hidden sm:block">
                Welcome back, {welcomeName}
              </p>
            </div>
            <div className="relative hidden md:flex items-center w-80">
              <Search className="absolute left-4 text-[#6c5ce7]/40" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-[#f0f2f8] rounded-2xl py-2.5 pl-11 pr-4 text-[13px] font-medium outline-none placeholder:text-slate-400 focus:bg-[#eee9ff] focus:ring-2 focus:ring-[#6c5ce7]/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-3">
              <div className="relative cursor-pointer text-slate-500 hover:text-[#6c5ce7] transition-colors p-2 rounded-xl hover:bg-[#eee9ff]">
                <Bell size={20} />
                <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-[#ff6b81] text-[9px] font-bold text-white animate-badge-pulse">6</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <AccountMenu compact />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-8 py-8 bg-[#f0f2f8]">
          <div className="mx-auto max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
