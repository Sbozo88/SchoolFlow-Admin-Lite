"use client";

import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  FileText,
  MessageSquareText,
  Settings,
  GraduationCap,
  Users,
  CheckCircle,
  LifeBuoy,
  Inbox,
  Bell,
  Mail,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const primaryNavItems = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Learners", href: "/admin/learners", icon: Users },
  { label: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Follow-ups", href: "/admin/follow-ups", icon: MessageSquareText },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "Parent Form", href: "/admin/parent-submissions", icon: Inbox },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const secondaryNavItems = [
  { label: "Setup Sprint", href: "/admin/setup-sprint", icon: CheckCircle },
  { label: "Monthly Support", href: "/admin/support", icon: LifeBuoy },
];

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: { label: string; href: string; icon: React.ElementType };
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      className={`flex min-h-[44px] items-center gap-3 px-6 text-sm font-semibold transition-colors relative ${
        isActive
          ? "bg-orange-50/50 text-orange-500 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-orange-500"
          : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
      }`}
      href={item.href}
      onClick={onClick}
    >
      <Icon size={20} className={isActive ? "text-orange-500" : "text-slate-400"} />
      {item.label}
    </Link>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derive title from pathname
  const activePrimary = primaryNavItems.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href)
  );
  const activeSecondary = secondaryNavItems.find((item) => pathname?.startsWith(item.href));
  const title = activePrimary?.label || activeSecondary?.label || "Dashboard";

  const sidebarContent = (
    <>
      <div className="h-20 flex items-center gap-3 px-8 mb-4 shrink-0">
        <div className="text-orange-500">
          <GraduationCap size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          SchoolFlow.
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-8">
        <nav className="flex flex-col gap-1">
          {primaryNavItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);

            return (
              <NavLink
                key={item.label}
                item={item}
                isActive={isActive}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            );
          })}
        </nav>

        <nav className="flex flex-col gap-1 mt-auto pb-6">
          <h3 className="px-6 pb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Admin Tools
          </h3>
          {secondaryNavItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <NavLink
                key={item.label}
                item={item}
                isActive={isActive}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            );
          })}
        </nav>
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-[#F4F7FE] dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-[260px] bg-white dark:bg-slate-800 hidden lg:flex flex-col border-r border-slate-100 dark:border-slate-700 shadow-sm fixed inset-y-0 left-0 z-10">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Sidebar panel */}
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-800 flex flex-col shadow-xl animate-slide-in">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-5 right-4 size-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition z-10"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        {/* Top Header */}
        <header className="h-20 lg:h-24 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-[#F4F7FE]/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden size-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                School Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-800 px-2 sm:px-3 py-2 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <ThemeToggle />
            <button
              className="size-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <button
              className="hidden sm:flex size-9 rounded-full items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              aria-label="Messages"
            >
              <Mail size={18} />
            </button>
            <div className="pl-2 pr-1 border-l border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <AccountMenu />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="px-4 lg:px-8 pb-8 flex-1">{children}</section>
      </div>
    </main>
  );
}
