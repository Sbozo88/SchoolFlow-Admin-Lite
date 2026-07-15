"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { Card } from "@/components/ui/Card";

type PlatformUserRow = {
  id: string;
  email?: string;
  displayName?: string;
  role?: string;
  platformRole?: string;
  tenantId?: string;
  status?: string;
};

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<PlatformUserRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) return undefined;
    const q = query(collection(getFirebaseDb(), "users"), limit(100));
    return onSnapshot(
      q,
      (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PlatformUserRow)),
      () => setError("Could not load users (platform role required)."),
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Platform & client users</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Super Admins, support staff, and client administrators (from users collection).
        </p>
      </div>
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Platform role</th>
              <th className="px-4 py-3">Tenant role</th>
              <th className="px-4 py-3">Tenant</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="font-bold dark:text-white">{u.displayName || u.email || u.id}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-xs font-semibold dark:text-slate-300">{u.platformRole || "—"}</td>
                <td className="px-4 py-3 text-xs font-semibold dark:text-slate-300">{u.role || "—"}</td>
                <td className="px-4 py-3 font-mono text-[11px] dark:text-slate-300">{u.tenantId || "—"}</td>
                <td className="px-4 py-3 text-xs dark:text-slate-300">{u.status || "—"}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                  No user profiles visible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
