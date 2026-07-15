"use client";

import { Link, useSearchParams } from "react-router-dom";
import { usePlatformTenants } from "@/hooks/usePlatformTenants";
import { Card } from "@/components/ui/Card";
import { useTenant } from "@/components/tenant/TenantProvider";

export default function ClientMonitorPage() {
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenantId") ?? "";
  const { tenants } = usePlatformTenants();
  const { startImpersonation } = useTenant();
  const tenant = tenants.find((t) => t.id === tenantId);

  if (!tenantId) {
    return <p className="text-sm text-slate-600">Provide ?tenantId= to monitor a client.</p>;
  }

  if (!tenant) {
    return (
      <p className="text-sm text-slate-600">
        Tenant <span className="font-mono">{tenantId}</span> not loaded yet or missing.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">{tenant.name}</h1>
        <p className="mt-1 font-mono text-xs text-slate-500">{tenant.id}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Status</p>
          <p className="mt-2 font-black capitalize">{tenant.status}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Subscription</p>
          <p className="mt-2 font-black">{tenant.subscriptionStatus}</p>
          <p className="text-xs text-slate-500">Plan {tenant.planId}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Storage</p>
          <p className="mt-2 font-black">
            {tenant.storageUsedBytes ?? 0} / {tenant.storageQuotaBytes ?? 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Admin</p>
          <p className="mt-2 text-sm font-semibold">{tenant.adminEmail}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Trial ends</p>
          <p className="mt-2 text-sm font-semibold">{tenant.trialEndsAt || "—"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Notes</p>
          <p className="mt-2 text-sm">{tenant.notes || "—"}</p>
        </Card>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white"
          onClick={() => {
            startImpersonation(tenant.id, "read");
            window.location.href = `/admin?tenantId=${encodeURIComponent(tenant.id)}`;
          }}
        >
          Open client workspace (impersonate)
        </button>
        <Link to="/super-admin/audit" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">
          View audit logs
        </Link>
      </div>
    </div>
  );
}
