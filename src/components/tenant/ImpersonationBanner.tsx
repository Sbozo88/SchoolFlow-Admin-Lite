"use client";

import Link from "next/link";
import { useTenant } from "@/components/tenant/TenantProvider";
import { Button } from "@/components/ui/Button";

/** Additive SaaS chrome only — does not restyle school admin navigation. */
export function ImpersonationBanner() {
  const { isImpersonating, impersonation, endImpersonation, canWrite } = useTenant();
  if (!isImpersonating || !impersonation) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">
        Support view: tenant <span className="font-mono">{impersonation.tenantId}</span> (
        {impersonation.mode}
        {!canWrite ? ", read-only" : ""})
      </p>
      <div className="flex items-center gap-2">
        <Link className="text-xs font-bold text-amber-900 underline" href="/super-admin/clients">
          Back to Super Admin
        </Link>
        <Button type="button" variant="secondary" className="h-8 px-3 text-xs" onClick={endImpersonation}>
          End impersonation
        </Button>
      </div>
    </div>
  );
}
