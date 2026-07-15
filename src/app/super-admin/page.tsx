"use client";

import { usePlatformTenants } from "@/hooks/usePlatformTenants";
import { Card } from "@/components/ui/Card";

export default function SuperAdminDashboardPage() {
  const { stats, syncState, tenants } = usePlatformTenants();

  const cards = [
    { label: "Total clients", value: stats.totalClients },
    { label: "Active / trial", value: stats.activeClients },
    { label: "Suspended", value: stats.suspendedClients },
    { label: "Archived", value: stats.archivedClients },
    { label: "Active subscriptions", value: stats.activeSubscriptions },
    { label: "Trials", value: stats.trialClients },
    { label: "Storage (bytes)", value: stats.storageUsage },
    { label: "System health", value: stats.systemHealth },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Platform monitoring</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live counters derived from tenant records ({syncState}). Online users and revenue require
          future telemetry adapters.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{card.value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <h2 className="text-sm font-bold text-slate-900">Recent tenants</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {tenants.slice(0, 8).map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2 text-sm">
              <span className="font-semibold text-slate-800">{t.name}</span>
              <span className="text-xs font-medium text-slate-500">
                {t.status} · {t.subscriptionStatus}
              </span>
            </li>
          ))}
          {tenants.length === 0 && (
            <li className="py-4 text-sm text-slate-500">No clients yet. Create one under Clients.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
