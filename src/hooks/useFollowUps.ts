import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import type { FollowUp } from "@/types/followUp";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { stampTenantCreate, stampTenantUpdate } from "@/lib/tenant/stamp";
import { assertSameTenant } from "@/lib/tenant/filter";
import type { TenantWriteContext } from "@/lib/tenant/types";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { useMemo } from "react";

const FOLLOW_UPS_COLLECTION = "followUps";

const demoFollowUps: FollowUp[] = [
  {
    id: "followup-1",
    learnerId: "learner-zara-dlamini",
    learnerName: "Zara Dlamini",
    parentName: "Thandi Dlamini",
    parentPhone: "0845550103",
    reason: "absence",
    status: "urgent",
    message:
      "Good day Thandi Dlamini, hope you are well. Kindly note that Zara Dlamini was absent from Dance Foundations on 2026-05-26. Please confirm if everything is okay. Thank you.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function getFollowUpsCollection() {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return collection(getFirebaseDb(), FOLLOW_UPS_COLLECTION);
}

function getFollowUpDoc(followUpId: string) {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return doc(getFirebaseDb(), FOLLOW_UPS_COLLECTION, followUpId);
}

export async function createFollowUp(
  values: Omit<FollowUp, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
  ctx: TenantWriteContext,
) {
  const created = await addDoc(
    getFollowUpsCollection(),
    stampTenantCreate({ ...values }, ctx, firestoreTimestamps),
  );
  return created.id;
}

export async function updateFollowUp(
  followUpId: string,
  values: Partial<Omit<FollowUp, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
  ctx: TenantWriteContext,
) {
  const existing = await getDoc(getFollowUpDoc(followUpId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "update follow-up");
  await updateDoc(getFollowUpDoc(followUpId), stampTenantUpdate({ ...values }, firestoreTimestamps));
}

export async function deleteFollowUp(followUpId: string, ctx: TenantWriteContext) {
  const existing = await getDoc(getFollowUpDoc(followUpId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "delete follow-up");
  await deleteDoc(getFollowUpDoc(followUpId));
}

export function useFollowUps() {
  const tenant = useOptionalTenant();
  const tenantId = tenant?.activeTenantId ?? null;
  const writeContext = tenant?.writeContext ?? null;

  const collectionState = useFirestoreCollection<FollowUp>(FOLLOW_UPS_COLLECTION, demoFollowUps, {
    orderByField: "createdAt",
    tenantId,
  });

  return useMemo(
    () => ({
      ...collectionState,
      createFollowUp: async (
        values: Omit<FollowUp, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return createFollowUp(values, writeContext);
      },
      updateFollowUp: async (
        followUpId: string,
        values: Partial<Omit<FollowUp, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return updateFollowUp(followUpId, values, writeContext);
      },
      deleteFollowUp: async (followUpId: string) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return deleteFollowUp(followUpId, writeContext);
      },
    }),
    [collectionState, tenant, writeContext],
  );
}
