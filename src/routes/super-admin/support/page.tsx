"use client";

import { useState } from "react";
import { sendAdminPasswordReset } from "@/firebase/auth";
import { writeAuditLog } from "@/firebase/audit";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePlatformTenants } from "@/hooks/usePlatformTenants";
import { useTenant } from "@/components/tenant/TenantProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function SuperAdminSupportPage() {
  const { user } = useAuth();
  const { tenants } = usePlatformTenants();
  const { startImpersonation } = useTenant();
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");

  async function handleReset() {
    setNotice("");
    try {
      await sendAdminPasswordReset(email);
      if (user) {
        await writeAuditLog({
          userId: user.uid,
          action: "password.reset_request",
          detail: email,
        });
      }
      setNotice("Password reset email requested via Firebase Auth.");
    } catch {
      setNotice("Could not send reset email. Check the address and Auth config.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Support center</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Assist clients, open read-only workspace views, and trigger password resets (client-side Firebase limits apply).
        </p>
      </div>

      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-bold dark:text-white">Password reset</h2>
        <Input label="User email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="button" onClick={() => void handleReset()}>
          Send reset email
        </Button>
        {notice && <p className="text-sm text-slate-600 dark:text-slate-400">{notice}</p>}
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-bold dark:text-white">Quick impersonation (audited, temporary)</h2>
        <ul className="mt-3 space-y-2">
          {tenants.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold dark:text-white">{t.name}</span>
              <Button
                type="button"
                variant="secondary"
                className="h-8 text-xs"
                onClick={() => {
                  startImpersonation(t.id, "read");
                  window.location.href = `/admin?tenantId=${encodeURIComponent(t.id)}`;
                }}
              >
                Open workspace
              </Button>
            </li>
          ))}
          {tenants.length === 0 && <li className="text-slate-500 dark:text-slate-400">No clients to support.</li>}
        </ul>
      </Card>

      <Card className="p-5 text-sm text-slate-600 dark:text-slate-400">
        <p className="font-bold text-slate-900 dark:text-white">Troubleshooting notes</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Confirm users/{"{uid}"} has platformRole or tenantId + role.</li>
          <li>Resend invitations: re-run provision or update invitations collection (email delivery future-ready).</li>
          <li>Review audit logs for impersonation, billing, and lifecycle events.</li>
        </ul>
      </Card>
    </div>
  );
}
