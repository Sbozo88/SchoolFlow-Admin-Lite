"use client";

import { useState } from "react";
import { SUBSCRIPTION_PLANS, noopPaymentGateway, buildInvoiceDraft } from "@/lib/billing/plans";
import { Card } from "@/components/ui/Card";
import { usePlatformTenants } from "@/hooks/usePlatformTenants";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import type { TenantRecord, SubscriptionStatus } from "@/lib/tenant/types";

export default function SuperAdminBillingPage() {
  const { tenants, assignPlan, updateClient } = usePlatformTenants();
  
  const [editing, setEditing] = useState<TenantRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [editForm, setEditForm] = useState({
    subscriptionStatus: "active" as SubscriptionStatus,
    trialEndsAt: "",
    subscriptionExpiresAt: "",
  });

  function openEdit(t: TenantRecord) {
    setEditing(t);
    setEditForm({
      subscriptionStatus: t.subscriptionStatus || "active",
      trialEndsAt: t.trialEndsAt || "",
      subscriptionExpiresAt: t.subscriptionExpiresAt || "",
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      await updateClient(editing.id, {
        subscriptionStatus: editForm.subscriptionStatus,
        trialEndsAt: editForm.trialEndsAt || null,
        subscriptionExpiresAt: editForm.subscriptionExpiresAt || null,
      });
      setEditing(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

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
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    {t.subscriptionStatus} · expires {t.subscriptionExpiresAt || t.trialEndsAt || "—"}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Next invoice draft: {draft.amount} {draft.currency} ({draft.status})
                    {plan ? ` · ${plan.name}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
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
                  <button
                    type="button"
                    className="rounded bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-slate-800 dark:text-slate-300"
                    onClick={() => openEdit(t)}
                  >
                    Edit Lifecycle
                  </button>
                </div>
              </li>
            );
          })}
          {tenants.length === 0 && (
            <li className="py-4 text-sm text-slate-500 dark:text-slate-400">No tenants to bill.</li>
          )}
        </ul>
      </Card>

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title="Edit Billing Lifecycle">
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{editing.id}</p>
            <p className="text-sm font-bold dark:text-white">{editing.name}</p>

            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              Subscription Status
              <select
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={editForm.subscriptionStatus}
                onChange={(e) => setEditForm({ ...editForm, subscriptionStatus: e.target.value as SubscriptionStatus })}
              >
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Trial Ends At"
                type="date"
                value={editForm.trialEndsAt}
                onChange={(e) => setEditForm({ ...editForm, trialEndsAt: e.target.value })}
              />
              <Input
                label="Subscription Expires At"
                type="date"
                value={editForm.subscriptionExpiresAt}
                onChange={(e) => setEditForm({ ...editForm, subscriptionExpiresAt: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
