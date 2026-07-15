import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import type { MissingInfoItem, MissingInfoStatus } from "@/types/setupSprint";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { stampTenantCreate, stampTenantUpdate } from "@/lib/tenant/stamp";
import { assertSameTenant } from "@/lib/tenant/filter";
import type { TenantWriteContext } from "@/lib/tenant/types";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { useMemo } from "react";

const MISSING_INFO_COLLECTION = "missingInfoItems";

const demoMissingInfo: MissingInfoItem[] = [
  {
    id: "info-1",
    learnerName: "Zara Dlamini",
    category: "parent_contact",
    description: "Missing secondary emergency contact",
    status: "open",
    priority: "low",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function getMissingInfoCollection() {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return collection(getFirebaseDb(), MISSING_INFO_COLLECTION);
}

function getMissingInfoDoc(itemId: string) {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return doc(getFirebaseDb(), MISSING_INFO_COLLECTION, itemId);
}

export async function createMissingInfoItem(
  values: Omit<MissingInfoItem, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
  ctx: TenantWriteContext,
) {
  const created = await addDoc(
    getMissingInfoCollection(),
    stampTenantCreate({ ...values }, ctx, firestoreTimestamps),
  );
  return created.id;
}

export async function updateMissingInfoItem(
  itemId: string,
  values: Partial<Omit<MissingInfoItem, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
  ctx: TenantWriteContext,
) {
  const existing = await getDoc(getMissingInfoDoc(itemId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "update missing info");
  await updateDoc(getMissingInfoDoc(itemId), stampTenantUpdate({ ...values }, firestoreTimestamps));
}

export async function updateMissingInfoStatus(
  itemId: string,
  status: MissingInfoStatus,
  ctx: TenantWriteContext,
) {
  const existing = await getDoc(getMissingInfoDoc(itemId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "update missing info status");
  await updateDoc(getMissingInfoDoc(itemId), stampTenantUpdate({ status }, firestoreTimestamps));
}

export async function deleteMissingInfoItem(itemId: string, ctx: TenantWriteContext) {
  const existing = await getDoc(getMissingInfoDoc(itemId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "delete missing info");
  await deleteDoc(getMissingInfoDoc(itemId));
}

export function useMissingInfoItems() {
  const tenant = useOptionalTenant();
  const tenantId = tenant?.activeTenantId ?? null;
  const writeContext = tenant?.writeContext ?? null;

  const collectionState = useFirestoreCollection<MissingInfoItem>(
    MISSING_INFO_COLLECTION,
    demoMissingInfo,
    { orderByField: "createdAt", tenantId },
  );

  return useMemo(
    () => ({
      ...collectionState,
      createMissingInfoItem: async (
        values: Omit<MissingInfoItem, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        return createMissingInfoItem(values, writeContext);
      },
      updateMissingInfoItem: async (
        itemId: string,
        values: Partial<Omit<MissingInfoItem, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        return updateMissingInfoItem(itemId, values, writeContext);
      },
      updateMissingInfoStatus: async (itemId: string, status: MissingInfoStatus) => {
        if (!writeContext) throw new Error("No tenant write context");
        return updateMissingInfoStatus(itemId, status, writeContext);
      },
      deleteMissingInfoItem: async (itemId: string) => {
        if (!writeContext) throw new Error("No tenant write context");
        return deleteMissingInfoItem(itemId, writeContext);
      },
    }),
    [collectionState, writeContext],
  );
}
