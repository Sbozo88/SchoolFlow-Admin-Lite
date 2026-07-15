"use client";

import { SUBSCRIPTION_PLANS, noopPaymentGateway, buildInvoiceDraft } from "@/lib/billing/plans";
import { Card } from "@/components/ui/Card";
import { usePlatformTenants } from "@/hooks/usePlatformTenants";

export default function SuperAdminBillingPage() {
  const { tenants, assignPlan } = usePlatformTenants();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Billing</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Modular plans, trials, and invoice drafts. Gateway adapter:{" "}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800 dark:text-slate-300">{noopPaymentGateway.id}</code> (no live charges).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card key={plan.id} className="p-5">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{plan.name}</h2>
            <p className="mt-2 text-2xl font-black dark:text-white">
              {plan.priceMonthly}{" "}
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{plan.currency}/mo</span>
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Up to {plan.learnerLimit} learners</p>
            <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tenant subscriptions</h2>
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {tenants.map((t) => {
            const plan = SUBSCRIPTION_PLANS.find((p) => p.id === (t.planId || "plan-starter"));
            const draft = buildInvoiceDraft({
              tenantId: t.id,
              planId: t.planId || "plan-starter",
              actorUserId: "platform",
              periodStart: "2026-07-01",
              periodEnd: "2026-08-01",
              now: () => "billing-preview",
            });
            return (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-bold dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.subscriptionStatus} · expires {t.subscriptionExpiresAt || t.trialEndsAt || "—"}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Next invoice draft: {draft.amount} {draft.currency} ({draft.status})
                    {plan ? ` · ${plan.name}` : ""}
                  </p>
                </div>
                <select
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  value={t.planId}
                  onChange={(e) => void assignPlan(t.id, e.target.value)}
                >
                  {SUBSCRIPTION_PLANS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </li>
            );
          })}
          {tenants.length === 0 && (
            <li className="py-4 text-sm text-slate-500 dark:text-slate-400">No tenants to bill.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
