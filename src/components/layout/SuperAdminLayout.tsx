import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Bell,
  Building2,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Search,
  ScrollText,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandedLoading } from "@/components/ui/BrandedLoading";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const nav = [
  { href: "/super-admin", label: "Overview", icon: LayoutDashboard },
  { href: "/super-admin/clients", label: "Schools", icon: Building2 },
  { href: "/super-admin/users", label: "Users", icon: Users },
  { href: "/super-admin/billing", label: "Billing", icon: CreditCard },
  { href: "/super-admin/support", label: "Support", icon: LifeBuoy },
  { href: "/super-admin/audit", label: "Audit trail", icon: ScrollText },
];

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile, user, logout, platformRole } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isDashboard = pathname === "/super-admin" || pathname === "/super-admin/";
  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? nav.filter((item) => item.label.toLowerCase().includes(query)) : [];
  }, [search]);

  const displayName = profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Platform Admin";
  const initials = displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  async function handleLogout() {
    setIsSigningOut(true);
    try {
      await logout();
      navigate("/", { replace: true });
    } catch {
      setIsSigningOut(false);
    }
  }

  function openSearchResult(href: string) {
    setSearch("");
    navigate(href);
  }

  return (
    <div className="flex min-h-screen bg-[#f3f5f9] text-slate-900 dark:bg-[#0b0b0d] dark:text-white transition-colors duration-300">
      {isSigningOut ? (
        <div className="fixed inset-0 z-[80]">
          <BrandedLoading fullScreen title="Signing you out" detail="Closing your platform session." />
        </div>
      ) : null}

      {isSidebarOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-slate-200 bg-white text-slate-900 transition-transform duration-300 dark:border-white/[0.07] dark:bg-[#151517] dark:text-white lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-24 items-center justify-between px-6">
          <Link className="flex items-center gap-3" onClick={() => setIsSidebarOpen(false)} to="/super-admin">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-[#9f8cff] to-[#6551e8] shadow-[0_12px_30px_rgba(112,85,255,0.3)]">
              <img alt="SchoolFlow" className="size-6 object-contain brightness-0 invert" src="/images/logo.png" />
            </span>
            <span>
              <span className="block text-[17px] font-black tracking-tight">SchoolFlow</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-white/35">Platform OS</span>
            </span>
          </Link>
          <button className="text-slate-400 hover:text-slate-900 dark:text-white/50 dark:hover:text-white lg:hidden" onClick={() => setIsSidebarOpen(false)} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="px-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.07] dark:bg-white/[0.035]">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-white/30">Workspace</p>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <span className="truncate text-sm font-semibold text-slate-800 dark:text-white/80">Super Admin</span>
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1.5 overflow-y-auto px-4">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-white/25">Platform</p>
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/super-admin"
              ? isDashboard
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[13px] font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-[#7762f4] to-[#5e4ad8] text-white shadow-[0_10px_24px_rgba(94,74,216,0.22)]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-white/48 dark:hover:bg-white/[0.055] dark:hover:text-white"
                }`}
                onClick={() => setIsSidebarOpen(false)}
                to={item.href}
              >
                <Icon className={active ? "text-white" : "text-slate-400 group-hover:text-slate-700 dark:text-white/35 dark:group-hover:text-white/80"} size={17} />
                {item.label}
                {active ? <span className="absolute right-3 size-1.5 rounded-full bg-white/80" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 mb-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-[#7b68ee]/20 dark:bg-gradient-to-br dark:from-[#302b50] dark:to-[#201d32]">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-[#b8aaff]">
            <ShieldCheck size={16} />
            <p className="text-xs font-bold">Platform protected</p>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500 dark:text-white/42">Tenant isolation and role gates are active.</p>
          <Link className="mt-3 inline-flex text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-white/75 dark:hover:text-white" to="/super-admin/audit">
            Review audit trail →
          </Link>
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-white/[0.07]">
          <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#9f8cff] to-[#5d47d8] text-xs font-black text-white">
              {initials || "SA"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800 dark:text-white/85">{displayName}</p>
              <p className="truncate text-[10px] capitalize text-slate-500 dark:text-white/35">{platformRole?.replace(/_/g, " ") || "platform"}</p>
            </div>
            <button aria-label="Sign out" className="text-slate-400 transition hover:text-slate-800 dark:text-white/30 dark:hover:text-white" disabled={isSigningOut} onClick={() => void handleLogout()} type="button">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#0b0b0d]/90 md:px-7">
          <button
            aria-label="Open navigation"
            className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-white lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
            type="button"
          >
            <Menu size={19} />
          </button>

          <div className="relative hidden w-full max-w-sm sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" size={17} />
            <input
              aria-label="Search platform navigation"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#806cf3] focus:ring-4 focus:ring-[#806cf3]/10 dark:border-white/[0.06] dark:bg-white/[0.055] dark:text-white dark:placeholder:text-white/25"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && searchResults[0]) openSearchResult(searchResults[0].href);
              }}
              placeholder="Search platform areas…"
              value={search}
            />
            {searchResults.length > 0 ? (
              <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                {searchResults.map((item) => (
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800" key={item.href} onClick={() => openSearchResult(item.href)} type="button">
                    <item.icon size={16} /> {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              aria-label="Open audit notifications"
              className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white/55 dark:hover:text-white"
              to="/super-admin/audit"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#ff8aa5]" />
            </Link>
            <div className="hidden h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 dark:border-white/[0.07] dark:bg-white/[0.04] sm:flex">
              <span className="grid size-6 place-items-center rounded-lg bg-gradient-to-br from-[#9f8cff] to-[#5e49d7] text-[9px] font-black text-white">{initials || "SA"}</span>
              <span className="max-w-28 truncate text-[11px] font-bold text-slate-700 dark:text-white/65">{displayName}</span>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-76px)] bg-[#f3f5f9] p-4 dark:bg-[#0b0b0d] md:p-7 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
