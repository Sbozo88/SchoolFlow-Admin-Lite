import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  FileText,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AccountMenu } from "@/components/auth/AccountMenu";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Learners", href: "/admin/learners", icon: Users },
  { label: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Follow-ups", href: "/admin/follow-ups", icon: MessageSquareText },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({
  children,
  activeItem = "Dashboard",
}: {
  children: React.ReactNode;
  activeItem?: string;
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-slate-950 text-white">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-teal-700">SchoolFlow</p>
              <h1 className="text-xl font-black leading-tight text-slate-950">Admin LITE</h1>
            </div>
          </div>
          <AccountMenu />
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav className="grid gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === activeItem;

              return (
                <Link
                  className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-bold transition ${
                    isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                  href={item.href}
                  key={item.label}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
