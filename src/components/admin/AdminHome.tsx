"use client";

import { CheckCircle2, Database, LockKeyhole, Users } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import type { AdminUserProfile } from "@/lib/types";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";

const EMPTY_USERS: AdminUserProfile[] = [];

const foundationItems = [
  "Next.js App Router shell",
  "Firebase Auth gate",
  "Admin-only role enforcement",
  "Fail-closed Firebase config",
  "Live Firestore collection hook",
];

export function AdminHome() {
  const { user } = useAuth();
  const {
    records: users,
    syncState,
    errorMessage,
    isConfigured,
    isLive,
  } = useFirestoreCollection<AdminUserProfile>("users", EMPTY_USERS);
  const adminCount = users.filter((profile) => profile.role === "admin").length;

  return (
    <div>
      <PageHeader
        description="A minimal admin workspace with auth, RBAC, Firebase safety, and live-data wiring ready for real modules."
        title="Dashboard"
      />
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">Protected workspace</p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">Admin foundation is online</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                This repo starts with the hardened SchoolFlow OS admin guardrails only. Product modules can be added after data ownership and permissions are explicit.
              </p>
            </div>
            <div className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 sm:flex">
              <LockKeyhole size={24} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {foundationItems.map((item) => (
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3" key={item}>
                <CheckCircle2 className="shrink-0 text-teal-700" size={18} />
                <span className="text-sm font-semibold text-slate-800">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        <aside className="grid gap-5">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-500">Firebase status</p>
                <p className="mt-1 text-lg font-black text-slate-950">{syncState}</p>
              </div>
              <div className={`flex size-11 items-center justify-center rounded-xl ${isLive ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"}`}>
                <Database size={22} />
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {isConfigured
                ? "Firebase credentials are present. Firestore access still depends on the admin role document."
                : "Firebase credentials are missing, so login and live data stay closed."}
            </p>
            {errorMessage ? (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{errorMessage}</p>
            ) : null}
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-500">Signed in as</p>
                <p className="mt-1 max-w-[280px] truncate text-lg font-black text-slate-950">{user?.email ?? "Admin"}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Users size={22} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase text-slate-500">Profiles</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{users.length}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase text-slate-500">Admins</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{adminCount}</p>
              </div>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
