"use client";

import { useMemo, useState } from "react";
import { usePlatformTenants } from "@/hooks/usePlatformTenants";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { bootstrapDemoPlatformInFirestore } from "@/firebase/bootstrapDemoPlatform";
import {
  DEMO_SCHOOL_DEFINITIONS,
  DEMO_SCHOOL_PASSWORD,
  getDemoLoginCredentials,
  type DemoLoginCredential,
} from "@/lib/provision/bootstrapDemoPlatform";

export default function SuperAdminDashboardPage() {
  const { stats, syncState, tenants } = usePlatformTenants();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState<DemoLoginCredential[] | null>(null);

  const previewCredentials = useMemo(
    () =>
      getDemoLoginCredentials({
        superAdminEmail: user?.email ?? null,
      }),
    [user?.email],
  );

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

  async function handleLoadDemoPlatform() {
    if (!user) {
      setMessage("Sign in with Firebase first. Super Admin uses your current login.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = await bootstrapDemoPlatformInFirestore({
        currentUser: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
      });
      setCredentials(result.loginCredentials);
      setMessage(
        `Loaded Super Admin (${result.superAdminEmail}) + ${result.schoolNames.join(" & ")}. ` +
          `School Auth accounts ready — use the demo credentials below to log into /admin.`,
      );
    } catch (err) {
      setMessage((err as Error).message || "Bootstrap failed.");
    } finally {
      setBusy(false);
    }
  }

  const shownCredentials = credentials ?? previewCredentials;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Platform monitoring</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live counters ({syncState}). Super Admin is your current Firebase user; demo schools get
            separate logins.
          </p>
        </div>
        <Button type="button" disabled={busy || !user} onClick={() => void handleLoadDemoPlatform()}>
          {busy ? "Loading demo…" : "Load demo platform"}
        </Button>
      </div>

      {message && (
        <Card className="border-teal-100 bg-teal-50/50 p-4 text-sm font-medium text-slate-700">{message}</Card>
      )}

      <Card className="p-4">
        <h2 className="text-sm font-bold text-slate-900">Demo login credentials</h2>
        <p className="mt-1 text-xs text-slate-500">
          Super Admin = the account you are signed in with now. School admins use the fixed emails and
          password <span className="font-mono font-semibold">{DEMO_SCHOOL_PASSWORD}</span> (Email/Password
          must be enabled in Firebase Auth).
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2 pr-3">Account</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Password</th>
                <th className="py-2">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shownCredentials.map((cred) => (
                <tr key={cred.label}>
                  <td className="py-2.5 pr-3 font-semibold text-slate-800">{cred.label}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-slate-700">{cred.email}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-slate-700">
                    {cred.password ?? "— (your current Firebase password)"}
                  </td>
                  <td className="py-2.5 text-xs text-slate-500">
                    {cred.workspace === "platform" ? "/super-admin" : "/admin"}
                    {cred.tenantId ? (
                      <span className="mt-0.5 block font-mono text-[10px] text-slate-400">{cred.tenantId}</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {user?.email && (
          <p className="mt-3 text-xs text-slate-500">
            Signed in as <span className="font-semibold text-slate-700">{user.email}</span> — this becomes
            Super Admin when you load the demo platform.
          </p>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-bold text-slate-900">Demo schools (bootstrap)</h2>
        <p className="mt-1 text-xs text-slate-500">
          Creates platform Super Admin on your user, two school tenants, Firebase Auth school admins,
          and demo learners / attendance / payments / submissions.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {DEMO_SCHOOL_DEFINITIONS.map((s) => (
            <li key={s.key} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2">
              <span className="font-semibold text-slate-800">{s.organizationName}</span>
              <span className="font-mono text-[11px] text-slate-400">{s.adminEmail}</span>
            </li>
          ))}
        </ul>
      </Card>

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
            <li className="py-4 text-sm text-slate-500">
              No clients yet. Click “Load demo platform” or create under Clients.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
