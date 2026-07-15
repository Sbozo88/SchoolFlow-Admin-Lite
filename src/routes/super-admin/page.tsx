import { useMemo, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CreditCard,
  Database,
  Download,
  LifeBuoy,
  Plus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { usePlatformTenants } from "@/hooks/usePlatformTenants";
import { useAuth } from "@/components/auth/AuthProvider";
import { bootstrapDemoPlatformInFirestore } from "@/firebase/bootstrapDemoPlatform";
import { buildPlatformDashboardMetrics, formatBytes, getTenantHealth } from "@/lib/platform/dashboard";
import {
  DEMO_SCHOOL_DEFINITIONS,
  DEMO_SCHOOL_PASSWORD,
  getDemoLoginCredentials,
  type DemoLoginCredential,
} from "@/lib/provision/bootstrapDemoPlatform";
import type { TenantRecord } from "@/lib/tenant/types";

type MetricCard = {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  accent: string;
};

export default function SuperAdminDashboardPage() {
  const { stats, syncState, tenants, errorMessage } = usePlatformTenants();
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState<DemoLoginCredential[] | null>(null);
  const metrics = useMemo(() => buildPlatformDashboardMetrics(tenants), [tenants]);
  const previewCredentials = useMemo(
    () => getDemoLoginCredentials({ superAdminEmail: user?.email ?? null }),
    [user?.email],
  );
  const shownCredentials = credentials ?? previewCredentials;
  const firstName = (profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Admin").split(/\s+/)[0];

  const metricCards: MetricCard[] = [
    {
      label: "Total schools",
      value: String(stats.totalClients),
      detail: `${stats.activeClients} active or in trial`,
      icon: Building2,
      accent: "from-[#806df4] to-[#5c49d7]",
    },
    {
      label: "Active subscriptions",
      value: String(stats.activeSubscriptions),
      detail: `${stats.trialClients} currently in trial`,
      icon: CreditCard,
      accent: "from-[#2fcf9f] to-[#178e70]",
    },
    {
      label: "Monthly revenue",
      value: formatCurrency(metrics.monthlyRecurringRevenue),
      detail: "From active paid plans",
      icon: BadgeDollarSign,
      accent: "from-[#f7bd66] to-[#dd7f43]",
    },
    {
      label: "Portfolio health",
      value: `${metrics.portfolioHealth}%`,
      detail: `${metrics.attentionTenants} school${metrics.attentionTenants === 1 ? "" : "s"} need attention`,
      icon: ShieldCheck,
      accent: "from-[#ff8aa5] to-[#d85478]",
    },
  ];

  const subscriptionMix = useMemo(() => {
    const active = tenants.filter((tenant) => tenant.subscriptionStatus === "active").length;
    const trial = tenants.filter((tenant) => tenant.subscriptionStatus === "trial").length;
    const attention = tenants.filter((tenant) => tenant.subscriptionStatus === "past_due").length;
    const inactive = Math.max(tenants.length - active - trial - attention, 0);
    return [
      { label: "Active", value: active, color: "#2fcf9f" },
      { label: "Trial", value: trial, color: "#806df4" },
      { label: "Past due", value: attention, color: "#ff8aa5" },
      { label: "Inactive", value: inactive, color: "#4a4a52" },
    ];
  }, [tenants]);
  const donutStyle = buildDonutGradient(subscriptionMix, tenants.length);

  async function handleLoadDemoPlatform() {
    if (!user) {
      setMessage("Sign in with Firebase first. Super Admin uses your current login.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = await bootstrapDemoPlatformInFirestore({
        currentUser: { uid: user.uid, email: user.email, displayName: user.displayName },
      });
      setCredentials(result.loginCredentials);
      setMessage(`Loaded ${result.schoolNames.join(" and ")} with their school admin accounts.`);
    } catch (error) {
      setMessage((error as Error).message || "Bootstrap failed.");
    } finally {
      setBusy(false);
    }
  }

  function exportPortfolio() {
    const header = ["School", "Tenant ID", "Status", "Subscription", "Plan", "Admin", "Storage used"];
    const rows = tenants.map((tenant) => [
      tenant.name,
      tenant.id,
      tenant.status,
      tenant.subscriptionStatus,
      tenant.planId,
      tenant.adminEmail,
      String(tenant.storageUsedBytes || 0),
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `schoolflow-platform-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 text-white">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-white/30">
            <span className={`size-2 rounded-full ${syncState === "Live" ? "bg-emerald-400" : "bg-amber-400"}`} />
            Platform control center · {syncState}
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white md:text-[38px]">Good day, {firstName}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/38">Monitor every school, subscription, and support signal from one live workspace.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.045] px-4 text-xs font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white" onClick={exportPortfolio} type="button">
            <Download size={16} /> Export portfolio
          </button>
          <Link className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#806df4] to-[#604bd9] px-4 text-xs font-bold text-white shadow-[0_12px_30px_rgba(96,75,217,0.28)] transition hover:brightness-110" to="/super-admin/clients">
            <Plus size={16} /> Add school
          </Link>
        </div>
      </section>

      {errorMessage ? (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          <CircleAlert size={18} /> {errorMessage}
        </div>
      ) : null}
      {message ? (
        <div className="flex items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-sm text-violet-100">
          <CheckCircle2 size={18} /> {message}
        </div>
      ) : null}

      <section aria-label="Platform metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="group relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#1c1c1f] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-white/[0.12]" key={card.label}>
              <div className={`absolute -right-10 -top-10 size-28 rounded-full bg-gradient-to-br ${card.accent} opacity-[0.08] blur-2xl transition group-hover:opacity-[0.14]`} />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/30">{card.label}</p>
                  <p className="mt-4 text-[30px] font-black tracking-[-0.035em] text-white">{card.value}</p>
                  <p className="mt-1.5 text-[11px] text-white/34">{card.detail}</p>
                </div>
                <span className={`grid size-10 place-items-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-lg`}>
                  <Icon size={18} />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)]">
        <article className="rounded-[24px] border border-white/[0.07] bg-[#1c1c1f] p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-base font-black text-white">Plan performance</p>
              <p className="mt-1 text-xs text-white/32">Live client distribution and recurring revenue by plan.</p>
            </div>
            <Link className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a99cff] hover:text-white" to="/super-admin/billing">Manage billing <ArrowRight size={14} /></Link>
          </div>
          <div className="mt-7 space-y-5">
            {metrics.plans.map((plan, index) => {
              const maxClients = Math.max(...metrics.plans.map((item) => item.clients), 1);
              const width = plan.clients === 0 ? 0 : Math.max((plan.clients / maxClients) * 100, 8);
              const colors = ["from-[#806df4] to-[#a18fff]", "from-[#2fcf9f] to-[#54e0b7]", "from-[#ff8aa5] to-[#ffb06f]"];
              return (
                <div className="grid gap-2 sm:grid-cols-[110px_minmax(0,1fr)_150px] sm:items-center" key={plan.id}>
                  <div>
                    <p className="text-xs font-bold text-white/75">{plan.name}</p>
                    <p className="mt-0.5 text-[10px] text-white/28">{plan.active} active</p>
                  </div>
                  <div className="h-8 overflow-hidden rounded-xl bg-white/[0.045]">
                    <div className={`flex h-full items-center rounded-xl bg-gradient-to-r ${colors[index]} px-3 transition-all duration-500`} style={{ width: `${width}%` }}>
                      {plan.clients > 0 ? <span className="text-[10px] font-black text-white">{plan.clients}</span> : null}
                    </div>
                  </div>
                  <p className="text-left text-xs font-bold text-white/60 sm:text-right">{formatCurrency(plan.revenue)} <span className="font-medium text-white/25">/ mo</span></p>
                </div>
              );
            })}
          </div>
          <div className="mt-7 grid gap-3 border-t border-white/[0.06] pt-5 sm:grid-cols-3">
            <SmallStat label="Storage used" value={formatBytes(metrics.storageUsed)} />
            <SmallStat label="Storage capacity" value={formatBytes(metrics.storageQuota)} />
            <SmallStat label="Utilization" value={`${metrics.storageUtilization}%`} />
          </div>
        </article>

        <article className="rounded-[24px] border border-white/[0.07] bg-[#1c1c1f] p-5 md:p-6">
          <p className="text-base font-black text-white">Subscription mix</p>
          <p className="mt-1 text-xs text-white/32">Current account standing.</p>
          <div className="mx-auto mt-7 grid size-44 place-items-center rounded-full" style={{ background: donutStyle }}>
            <div className="grid size-[118px] place-items-center rounded-full bg-[#1c1c1f] text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <div>
                <p className="text-3xl font-black tracking-tight">{tenants.length}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-white/28">Schools</p>
              </div>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3">
            {subscriptionMix.map((item) => (
              <div className="rounded-2xl bg-white/[0.035] px-3 py-2.5" key={item.label}>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-white/35"><span className="size-2 rounded-full" style={{ background: item.color }} />{item.label}</div>
                <p className="mt-1.5 text-lg font-black text-white/85">{item.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.65fr)]">
        <article className="overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#1c1c1f]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-5 md:px-6">
            <div>
              <p className="text-base font-black">School health</p>
              <p className="mt-1 text-xs text-white/30">Latest portfolio status and resource usage.</p>
            </div>
            <Link className="text-xs font-bold text-[#a99cff] hover:text-white" to="/super-admin/clients">View all schools →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-white/[0.025] text-[10px] font-bold uppercase tracking-[0.12em] text-white/25">
                <tr><th className="px-6 py-3">School</th><th className="px-4 py-3">Health</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Storage</th><th className="px-6 py-3 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-white/[0.055]">
                {tenants.slice(0, 6).map((tenant) => <TenantRow key={tenant.id} tenant={tenant} />)}
                {tenants.length === 0 ? (
                  <tr><td className="px-6 py-12 text-center text-sm text-white/32" colSpan={5}>No schools yet. Add your first school or open Demo access below.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-[24px] border border-white/[0.07] bg-[#1c1c1f] p-5 md:p-6">
          <p className="text-base font-black">Quick operations</p>
          <p className="mt-1 text-xs text-white/30">Common platform tasks.</p>
          <div className="mt-5 space-y-2.5">
            <QuickLink detail="Provision and manage tenants" href="/super-admin/clients" icon={Building2} label="Manage schools" />
            <QuickLink detail="Plans and subscription health" href="/super-admin/billing" icon={CreditCard} label="Review billing" />
            <QuickLink detail="Assist school administrators" href="/super-admin/support" icon={LifeBuoy} label="Open support" />
            <QuickLink detail="Review platform events" href="/super-admin/audit" icon={Activity} label="Audit activity" />
          </div>
        </article>
      </section>

      <details className="group overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#171719]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden md:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#806df4]/15 text-[#a99cff]"><Database size={18} /></span>
            <div><p className="text-sm font-black">Demo access & bootstrap</p><p className="mt-0.5 text-[11px] text-white/30">Seed two isolated schools and view their login credentials.</p></div>
          </div>
          <ChevronDown className="text-white/35 transition group-open:rotate-180" size={18} />
        </summary>
        <div className="border-t border-white/[0.06] p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white/80">Demo schools</p>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-white/32">Creates Greenfield Music Academy and Riverside Arts School with separate Auth users and tenant-scoped demo records.</p>
            </div>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-slate-950 transition hover:bg-violet-100 disabled:opacity-50" disabled={busy || !user} onClick={() => void handleLoadDemoPlatform()} type="button">
              <RefreshCw className={busy ? "animate-spin" : ""} size={15} /> {busy ? "Loading demo…" : "Load demo platform"}
            </button>
          </div>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="bg-white/[0.035] text-[10px] uppercase tracking-wider text-white/25"><tr><th className="px-4 py-3">Account</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Password</th><th className="px-4 py-3">Workspace</th></tr></thead>
              <tbody className="divide-y divide-white/[0.05]">
                {shownCredentials.map((credential) => (
                  <tr key={credential.label}><td className="px-4 py-3 font-bold text-white/70">{credential.label}</td><td className="px-4 py-3 font-mono text-white/48">{credential.email}</td><td className="px-4 py-3 font-mono text-white/48">{credential.password ?? "Your current Firebase password"}</td><td className="px-4 py-3 text-white/35">{credential.workspace === "platform" ? "/super-admin" : "/admin"}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-white/25">School demo password: <span className="font-mono text-white/50">{DEMO_SCHOOL_PASSWORD}</span> · {DEMO_SCHOOL_DEFINITIONS.length} demo tenants configured.</p>
        </div>
      </details>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/[0.035] px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-white/25">{label}</p><p className="mt-1.5 text-sm font-black text-white/75">{value}</p></div>;
}

function TenantRow({ tenant }: { tenant: TenantRecord }) {
  const health = getTenantHealth(tenant);
  const storagePercent = tenant.storageQuotaBytes > 0 ? Math.min(Math.round((tenant.storageUsedBytes / tenant.storageQuotaBytes) * 100), 100) : 0;
  const healthTone = health === "healthy" ? "bg-emerald-400/10 text-emerald-300" : health === "attention" ? "bg-rose-400/10 text-rose-300" : "bg-white/[0.05] text-white/35";
  return (
    <tr className="transition hover:bg-white/[0.02]">
      <td className="px-6 py-4"><p className="text-xs font-bold text-white/78">{tenant.name}</p><p className="mt-1 max-w-[220px] truncate text-[10px] text-white/28">{tenant.adminEmail}</p></td>
      <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${healthTone}`}>{health}</span></td>
      <td className="px-4 py-4 text-[11px] font-semibold capitalize text-white/45">{tenant.planId.replace("plan-", "")}</td>
      <td className="px-4 py-4"><div className="w-28"><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-gradient-to-r from-[#806df4] to-[#a99cff]" style={{ width: `${storagePercent}%` }} /></div><p className="mt-1.5 text-[9px] text-white/25">{storagePercent}% · {formatBytes(tenant.storageUsedBytes)}</p></div></td>
      <td className="px-6 py-4 text-right"><Link className="inline-flex items-center gap-1 text-[10px] font-bold text-[#a99cff] hover:text-white" to={`/super-admin/clients/monitor?tenantId=${encodeURIComponent(tenant.id)}`}>Monitor <ArrowRight size={12} /></Link></td>
    </tr>
  );
}

function QuickLink({ href, label, detail, icon: Icon }: { href: string; label: string; detail: string; icon: ComponentType<{ size?: number }> }) {
  return (
    <Link className="group flex items-center gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.025] p-3 transition hover:border-[#806df4]/35 hover:bg-[#806df4]/[0.08]" to={href}>
      <span className="grid size-9 place-items-center rounded-xl bg-white/[0.055] text-white/45 transition group-hover:bg-[#806df4]/20 group-hover:text-[#b4a8ff]"><Icon size={16} /></span>
      <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-white/70">{label}</span><span className="mt-0.5 block truncate text-[10px] text-white/25">{detail}</span></span>
      <ArrowRight className="text-white/18 transition group-hover:translate-x-0.5 group-hover:text-[#a99cff]" size={14} />
    </Link>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);
}

function buildDonutGradient(items: Array<{ value: number; color: string }>, total: number) {
  if (total === 0) return "conic-gradient(#34343a 0deg 360deg)";
  let cursor = 0;
  const stops = items.map((item) => {
    const start = cursor;
    cursor += (item.value / total) * 360;
    return `${item.color} ${start}deg ${cursor}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
