import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import type { PaymentRecord } from "@/types/payment";
import { demoPayments } from "@/utils/seedData";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { stampTenantCreate, stampTenantUpdate } from "@/lib/tenant/stamp";
import { assertSameTenant } from "@/lib/tenant/filter";
import type { TenantWriteContext } from "@/lib/tenant/types";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { useMemo } from "react";

const PAYMENTS_COLLECTION = "payments";

function getPaymentsCollection() {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return collection(getFirebaseDb(), PAYMENTS_COLLECTION);
}

function getPaymentDoc(id: string) {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return doc(getFirebaseDb(), PAYMENTS_COLLECTION, id);
}

export async function createPayment(
  values: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
  ctx: TenantWriteContext,
) {
  const created = await addDoc(
    getPaymentsCollection(),
    stampTenantCreate({ ...values }, ctx, firestoreTimestamps),
  );
  return created.id;
}

export async function updatePayment(
  id: string,
  values: Partial<Omit<PaymentRecord, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
  ctx: TenantWriteContext,
) {
  const existing = await getDoc(getPaymentDoc(id));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "update payment");
  await updateDoc(getPaymentDoc(id), stampTenantUpdate({ ...values }, firestoreTimestamps));
}

export async function deletePayment(id: string, ctx: TenantWriteContext) {
  const existing = await getDoc(getPaymentDoc(id));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "delete payment");
  await deleteDoc(getPaymentDoc(id));
}

export function usePayments() {
  const tenant = useOptionalTenant();
  const tenantId = tenant?.activeTenantId ?? null;
  const writeContext = tenant?.writeContext ?? null;

  const collectionState = useFirestoreCollection<PaymentRecord>(PAYMENTS_COLLECTION, demoPayments, {
    orderByField: "month",
    orderDirection: "desc",
    tenantId,
  });

  return useMemo(
    () => ({
      ...collectionState,
      createPayment: async (
        values: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return createPayment(values, writeContext);
      },
      updatePayment: async (
        id: string,
        values: Partial<Omit<PaymentRecord, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return updatePayment(id, values, writeContext);
      },
      deletePayment: async (id: string) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return deletePayment(id, writeContext);
      },
    }),
    [collectionState, tenant, writeContext],
  );
}
