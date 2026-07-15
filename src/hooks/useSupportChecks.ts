import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import type { SupportCheck } from "@/types/support";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { stampTenantCreate, stampTenantUpdate } from "@/lib/tenant/stamp";
import { assertSameTenant } from "@/lib/tenant/filter";
import type { TenantWriteContext } from "@/lib/tenant/types";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { useMemo } from "react";

const SUPPORT_CHECKS_COLLECTION = "supportChecks";

const demoSupportChecks: SupportCheck[] = [
  {
    id: "support-1",
    month: "2026-06",
    attendanceReviewed: true,
    paymentsReviewed: false,
    followUpsReviewed: false,
    missingInfoReviewed: false,
    reportsUpdated: false,
    recommendations: "Need to follow up with 3 parents regarding missing attendance info.",
    status: "in_progress",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function getSupportChecksCollection() {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return collection(getFirebaseDb(), SUPPORT_CHECKS_COLLECTION);
}

function getSupportCheckDoc(checkId: string) {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return doc(getFirebaseDb(), SUPPORT_CHECKS_COLLECTION, checkId);
}

export async function createSupportCheck(
  values: Omit<SupportCheck, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
  ctx: TenantWriteContext,
) {
  const created = await addDoc(
    getSupportChecksCollection(),
    stampTenantCreate({ ...values }, ctx, firestoreTimestamps),
  );
  return created.id;
}

export async function updateSupportCheck(
  checkId: string,
  values: Partial<Omit<SupportCheck, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
  ctx: TenantWriteContext,
) {
  const existing = await getDoc(getSupportCheckDoc(checkId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "update support check");
  await updateDoc(getSupportCheckDoc(checkId), stampTenantUpdate({ ...values }, firestoreTimestamps));
}

export async function deleteSupportCheck(checkId: string, ctx: TenantWriteContext) {
  const existing = await getDoc(getSupportCheckDoc(checkId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "delete support check");
  await deleteDoc(getSupportCheckDoc(checkId));
}

export function useSupportChecks() {
  const tenant = useOptionalTenant();
  const tenantId = tenant?.activeTenantId ?? null;
  const writeContext = tenant?.writeContext ?? null;

  const collectionState = useFirestoreCollection<SupportCheck>(
    SUPPORT_CHECKS_COLLECTION,
    demoSupportChecks,
    { orderByField: "month", tenantId },
  );

  return useMemo(
    () => ({
      ...collectionState,
      createSupportCheck: async (
        values: Omit<SupportCheck, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        return createSupportCheck(values, writeContext);
      },
      updateSupportCheck: async (
        checkId: string,
        values: Partial<Omit<SupportCheck, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        return updateSupportCheck(checkId, values, writeContext);
      },
      deleteSupportCheck: async (checkId: string) => {
        if (!writeContext) throw new Error("No tenant write context");
        return deleteSupportCheck(checkId, writeContext);
      },
    }),
    [collectionState, writeContext],
  );
}
