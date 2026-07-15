"use client";

import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { Card } from "@/components/ui/Card";
import type { AuditLogEntry } from "@/lib/audit/auditLog";

export default function SuperAdminAuditPage() {
  const [logs, setLogs] = useState<(AuditLogEntry & { id: string })[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) return undefined;
    const q = query(collection(getFirebaseDb(), "auditLogs"), orderBy("timestamp", "desc"), limit(100));
    return onSnapshot(
      q,
      (snap) => setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AuditLogEntry & { id: string })),
      () => setError("Could not load audit logs (platform role + index may be required)."),
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Audit log</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          login, logout, client lifecycle, impersonation, billing, and support actions.
        </p>
      </div>
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Tenant</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{log.timestamp}</td>
                <td className="px-4 py-3 font-semibold dark:text-slate-200">{log.action}</td>
                <td className="px-4 py-3 font-mono text-[11px] dark:text-slate-300">{log.userId}</td>
                <td className="px-4 py-3 font-mono text-[11px] dark:text-slate-300">{log.tenantId ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{log.detail ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
