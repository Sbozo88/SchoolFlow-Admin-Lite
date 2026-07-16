"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { AuditLogEntry } from "@/lib/audit/auditLog";

export default function SuperAdminAuditPage() {
  const [logs, setLogs] = useState<(AuditLogEntry & { id: string })[]>([]);
  const [error, setError] = useState("");
  
  const [filterTenantId, setFilterTenantId] = useState("");
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) return undefined;
    const q = query(collection(getFirebaseDb(), "auditLogs"), orderBy("timestamp", "desc"), limit(200));
    return onSnapshot(
      q,
      (snap) => setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AuditLogEntry & { id: string })),
      () => setError("Could not load audit logs (platform role + index may be required)."),
    );
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterTenantId && !log.tenantId?.includes(filterTenantId)) return false;
      if (filterAction && !log.action.includes(filterAction)) return false;
      return true;
    });
  }, [logs, filterTenantId, filterAction]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Audit log</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          login, logout, client lifecycle, impersonation, billing, and support actions.
        </p>
      </div>
      
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      
      <div className="flex flex-wrap gap-4">
        <div className="w-full sm:w-64">
          <Input 
            label="Filter by Tenant ID" 
            placeholder="e.g. org-123" 
            value={filterTenantId} 
            onChange={(e) => setFilterTenantId(e.target.value)} 
          />
        </div>
        <div className="w-full sm:w-64">
          <Input 
            label="Filter by Action" 
            placeholder="e.g. client.update" 
            value={filterAction} 
            onChange={(e) => setFilterAction(e.target.value)} 
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
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
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{log.timestamp}</td>
                  <td className="px-4 py-3 font-semibold dark:text-slate-200">{log.action}</td>
                  <td className="px-4 py-3 font-mono text-[11px] dark:text-slate-300">{log.userId}</td>
                  <td className="px-4 py-3 font-mono text-[11px] dark:text-slate-300">{log.tenantId ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{log.detail ?? "—"}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                    No audit entries match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
