"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import type { TenantRecord, TenantStatus } from "@/lib/tenant/types";
import { nextStatusForLifecycle, type ClientLifecycleAction } from "@/lib/platform/clients";
import { computePlatformStats } from "@/lib/platform/clients";
import { provisionClientInFirestore } from "@/firebase/provision";
import { writeAuditLog } from "@/firebase/audit";
import { useAuth } from "@/components/auth/AuthProvider";
import type { ProvisionClientInput } from "@/lib/provision/provisionTenant";

export function usePlatformTenants() {
  const { user, platformRole } = useAuth();
  const isConfigured = isFirebaseConfigured();
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [syncState, setSyncState] = useState(() => (isConfigured ? "Connecting" : "idle"));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isConfigured) return undefined;
    const q = query(collection(getFirebaseDb(), "tenants"), orderBy("name", "asc"));
    return onSnapshot(
      q,
      (snap) => {
        setTenants(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TenantRecord));
        setSyncState("Live");
        setErrorMessage("");
      },
      () => {
        setSyncState("Unavailable");
        setErrorMessage("Could not load tenants. Check platform role and rules.");
      },
    );
  }, [isConfigured, platformRole]);

  const stats = computePlatformStats({ tenants });

  const createClient = useCallback(
    async (input: ProvisionClientInput) => {
      if (!user) throw new Error("Not signed in");
      return provisionClientInFirestore(input, user.uid);
    },
    [user],
  );

  const applyLifecycle = useCallback(
    async (tenantId: string, action: ClientLifecycleAction) => {
      if (!user) throw new Error("Not signed in");
      const tenant = tenants.find((t) => t.id === tenantId);
      if (!tenant) throw new Error("Tenant not found");
      const next = nextStatusForLifecycle(tenant.status, action);
      if (next === "deleted") {
        await deleteDoc(doc(getFirebaseDb(), "tenants", tenantId));
        await writeAuditLog({
          userId: user.uid,
          action: "client.delete",
          tenantId,
        });
        return;
      }
      await updateDoc(doc(getFirebaseDb(), "tenants", tenantId), {
        status: next as TenantStatus,
        updatedAt: serverTimestamp(),
      });
      const auditAction =
        action === "suspend"
          ? "client.suspend"
          : action === "reactivate"
            ? "client.reactivate"
            : action === "archive"
              ? "client.archive"
              : "client.update";
      await writeAuditLog({
        userId: user.uid,
        action: auditAction,
        tenantId,
        detail: `status=${next}`,
      });
    },
    [tenants, user],
  );

  const assignPlan = useCallback(
    async (tenantId: string, planId: string) => {
      if (!user) throw new Error("Not signed in");
      await updateDoc(doc(getFirebaseDb(), "tenants", tenantId), {
        planId,
        subscriptionStatus: "active",
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog({
        userId: user.uid,
        action: "billing.update",
        tenantId,
        detail: `planId=${planId}`,
      });
    },
    [user],
  );

  const updateClient = useCallback(
    async (
      tenantId: string,
      patch: {
        name?: string;
        adminEmail?: string;
        notes?: string;
        storageQuotaBytes?: number;
        storageUsedBytes?: number;
        planId?: string;
        subscriptionStatus?: TenantRecord["subscriptionStatus"];
        trialEndsAt?: string | null;
        subscriptionExpiresAt?: string | null;
      },
    ) => {
      if (!user) throw new Error("Not signed in");
      const clean: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (patch.name !== undefined) clean.name = patch.name.trim();
      if (patch.adminEmail !== undefined) clean.adminEmail = patch.adminEmail.trim().toLowerCase();
      if (patch.notes !== undefined) clean.notes = patch.notes;
      if (patch.storageQuotaBytes !== undefined) clean.storageQuotaBytes = Number(patch.storageQuotaBytes);
      if (patch.storageUsedBytes !== undefined) clean.storageUsedBytes = Number(patch.storageUsedBytes);
      if (patch.planId !== undefined) clean.planId = patch.planId;
      if (patch.subscriptionStatus !== undefined) clean.subscriptionStatus = patch.subscriptionStatus;
      if (patch.trialEndsAt !== undefined) clean.trialEndsAt = patch.trialEndsAt;
      if (patch.subscriptionExpiresAt !== undefined) clean.subscriptionExpiresAt = patch.subscriptionExpiresAt;
      await updateDoc(doc(getFirebaseDb(), "tenants", tenantId), clean);
      await writeAuditLog({
        userId: user.uid,
        action: "client.update",
        tenantId,
        detail: Object.keys(patch).join(","),
      });
    },
    [user],
  );

  return {
    tenants,
    stats,
    syncState,
    errorMessage,
    createClient,
    applyLifecycle,
    assignPlan,
    updateClient,
  };
}
