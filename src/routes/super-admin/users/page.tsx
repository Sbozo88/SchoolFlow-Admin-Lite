"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, limit, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

type PlatformUserRow = {
  id: string;
  email?: string;
  displayName?: string;
  role?: string;
  platformRole?: string;
  tenantId?: string;
  status?: string;
};

const PLATFORM_ROLES = ["", "super_admin", "platform_support", "platform_manager"];
const TENANT_ROLES = ["", "admin", "client_admin", "manager", "dispatcher", "finance", "driver", "parent", "student"];

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<PlatformUserRow[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<PlatformUserRow | null>(null);
  const [busy, setBusy] = useState(false);
  
  const [editForm, setEditForm] = useState({
    platformRole: "",
    role: "",
    tenantId: "",
    status: "",
  });

  useEffect(() => {
    if (!isFirebaseConfigured()) return undefined;
    const q = query(collection(getFirebaseDb(), "users"), limit(100));
    return onSnapshot(
      q,
      (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PlatformUserRow)),
      () => setError("Could not load users (platform role required)."),
    );
  }, []);

  function openEdit(u: PlatformUserRow) {
    setEditing(u);
    setEditForm({
      platformRole: u.platformRole || "",
      role: u.role || "",
      tenantId: u.tenantId || "",
      status: u.status || "",
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      const db = getFirebaseDb();
      const clean = {
        platformRole: editForm.platformRole || null,
        role: editForm.role || null,
        tenantId: editForm.tenantId || null,
        status: editForm.status || null,
      };
      await updateDoc(doc(db, "users", editing.id), clean);
      setEditing(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(u: PlatformUserRow) {
    if (!confirm(`Delete user ${u.email || u.id}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteDoc(doc(getFirebaseDb(), "users", u.id));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Platform role</th>
                <th className="px-4 py-3">Tenant role</th>
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
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
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400"
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-800 dark:bg-rose-500/10 dark:text-rose-400"
                        onClick={() => void handleDelete(u)}
                        disabled={busy}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                    No user profiles visible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title="Edit user">
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{editing.id}</p>
            <p className="text-sm font-bold dark:text-white">{editing.email}</p>
            
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              Platform Role
              <select
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={editForm.platformRole}
                onChange={(e) => setEditForm({ ...editForm, platformRole: e.target.value })}
              >
                {PLATFORM_ROLES.map((r) => (
                  <option key={r} value={r}>{r || "None"}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              Tenant Role
              <select
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                {TENANT_ROLES.map((r) => (
                  <option key={r} value={r}>{r || "None"}</option>
                ))}
              </select>
            </label>

            <Input
              label="Tenant ID"
              value={editForm.tenantId}
              onChange={(e) => setEditForm({ ...editForm, tenantId: e.target.value })}
            />

            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              Status
              <select
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="">Default (Active)</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>

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
