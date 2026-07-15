"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { usePlatformTenants } from "@/hooks/usePlatformTenants";
import { useTenant } from "@/components/tenant/TenantProvider";
import { SUBSCRIPTION_PLANS } from "@/lib/billing/plans";
import type { TenantRecord } from "@/lib/tenant/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export default function SuperAdminClientsPage() {
  const { tenants, createClient, applyLifecycle, assignPlan, updateClient, errorMessage, syncState } =
    usePlatformTenants();
  const { startImpersonation } = useTenant();
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [planId, setPlanId] = useState(SUBSCRIPTION_PLANS[0].id);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<TenantRecord | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    adminEmail: "",
    notes: "",
    storageQuotaBytes: "",
    storageUsedBytes: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result = await createClient({
        organizationName: name,
        adminEmail,
        planId,
      });
      setMessage(`Provisioned ${result.tenantId}`);
      setName("");
      setAdminEmail("");
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function openEdit(t: TenantRecord) {
    setEditing(t);
    setEditForm({
      name: t.name ?? "",
      adminEmail: t.adminEmail ?? "",
      notes: t.notes ?? "",
      storageQuotaBytes: String(t.storageQuotaBytes ?? 0),
      storageUsedBytes: String(t.storageUsedBytes ?? 0),
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setMessage("");
    try {
      await updateClient(editing.id, {
        name: editForm.name,
        adminEmail: editForm.adminEmail,
        notes: editForm.notes,
        storageQuotaBytes: Number(editForm.storageQuotaBytes) || 0,
        storageUsedBytes: Number(editForm.storageUsedBytes) || 0,
      });
      setMessage(`Updated ${editForm.name}`);
      setEditing(null);
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Client management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Provision, edit, assign plans, lifecycle, and support impersonation ({syncState}).
        </p>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900">Create client (auto-provision)</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            label="Organization name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Initial admin email"
            type="email"
            required
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Plan
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
            >
              {SUBSCRIPTION_PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.priceMonthly} {p.currency}/mo)
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <Button type="submit" disabled={busy}>
              {busy ? "Provisioning…" : "Create & provision"}
            </Button>
          </div>
        </form>
        {message && <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>}
        {errorMessage && <p className="mt-2 text-sm text-rose-600">{errorMessage}</p>}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Subscription</th>
                <th className="px-4 py-3">Storage</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="font-mono text-[11px] text-slate-400">{t.id}</p>
                    <p className="text-xs text-slate-500">{t.adminEmail}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold capitalize">{t.status}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded border border-slate-200 px-2 py-1 text-xs"
                      value={t.planId}
                      onChange={(e) => void assignPlan(t.id, e.target.value)}
                    >
                      {SUBSCRIPTION_PLANS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs">{t.subscriptionStatus}</td>
                  <td className="px-4 py-3 text-xs">
                    {t.storageUsedBytes ?? 0} / {t.storageQuotaBytes ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        className="rounded bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-800"
                        onClick={() => openEdit(t)}
                      >
                        Edit
                      </button>
                      <Link
                        className="rounded bg-slate-100 px-2 py-1 text-[11px] font-bold"
                        to={`/super-admin/clients/monitor?tenantId=${encodeURIComponent(t.id)}`}
                      >
                        Monitor
                      </Link>
                      <button
                        type="button"
                        className="rounded bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-800"
                        onClick={() => {
                          startImpersonation(t.id, "read");
                          window.location.href = `/admin?tenantId=${encodeURIComponent(t.id)}`;
                        }}
                      >
                        Impersonate
                      </button>
                      <button
                        type="button"
                        className="rounded bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800"
                        onClick={() => void applyLifecycle(t.id, "suspend")}
                      >
                        Suspend
                      </button>
                      <button
                        type="button"
                        className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800"
                        onClick={() => void applyLifecycle(t.id, "reactivate")}
                      >
                        Reactivate
                      </button>
                      <button
                        type="button"
                        className="rounded bg-slate-100 px-2 py-1 text-[11px] font-bold"
                        onClick={() => void applyLifecycle(t.id, "archive")}
                      >
                        Archive
                      </button>
                      <button
                        type="button"
                        className="rounded bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700"
                        onClick={() => {
                          if (confirm(`Delete client ${t.name}?`)) void applyLifecycle(t.id, "delete");
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No clients provisioned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title="Edit client">
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <p className="font-mono text-[11px] text-slate-400">{editing.id}</p>
            <Input
              label="Organization name"
              required
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              label="Admin email"
              type="email"
              required
              value={editForm.adminEmail}
              onChange={(e) => setEditForm((f) => ({ ...f, adminEmail: e.target.value }))}
            />
            <Input
              label="Notes"
              value={editForm.notes}
              onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Storage used (bytes)"
                type="number"
                value={editForm.storageUsedBytes}
                onChange={(e) => setEditForm((f) => ({ ...f, storageUsedBytes: e.target.value }))}
              />
              <Input
                label="Storage quota (bytes)"
                type="number"
                value={editForm.storageQuotaBytes}
                onChange={(e) => setEditForm((f) => ({ ...f, storageQuotaBytes: e.target.value }))}
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
