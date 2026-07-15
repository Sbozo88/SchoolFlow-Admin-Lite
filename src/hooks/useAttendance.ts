import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import type { AttendanceRecord } from "@/types/attendance";
import { demoAttendance } from "@/utils/seedData";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { stampTenantCreate, stampTenantUpdate } from "@/lib/tenant/stamp";
import { assertSameTenant } from "@/lib/tenant/filter";
import type { TenantWriteContext } from "@/lib/tenant/types";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { useMemo } from "react";

const ATTENDANCE_COLLECTION = "attendance";

function getAttendanceCollection() {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return collection(getFirebaseDb(), ATTENDANCE_COLLECTION);
}

function getAttendanceDoc(id: string) {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return doc(getFirebaseDb(), ATTENDANCE_COLLECTION, id);
}

export async function createAttendance(
  values: Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
  ctx: TenantWriteContext,
) {
  const created = await addDoc(
    getAttendanceCollection(),
    stampTenantCreate({ ...values }, ctx, firestoreTimestamps),
  );
  return created.id;
}

export async function updateAttendance(
  id: string,
  values: Partial<Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
  ctx: TenantWriteContext,
) {
  const existing = await getDoc(getAttendanceDoc(id));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "update attendance");
  await updateDoc(getAttendanceDoc(id), stampTenantUpdate({ ...values }, firestoreTimestamps));
}

export async function deleteAttendance(id: string, ctx: TenantWriteContext) {
  const existing = await getDoc(getAttendanceDoc(id));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "delete attendance");
  await deleteDoc(getAttendanceDoc(id));
}

export function useAttendance() {
  const tenant = useOptionalTenant();
  const tenantId = tenant?.activeTenantId ?? null;
  const writeContext = tenant?.writeContext ?? null;

  const collectionState = useFirestoreCollection<AttendanceRecord>(ATTENDANCE_COLLECTION, demoAttendance, {
    orderByField: "date",
    orderDirection: "desc",
    tenantId,
  });

  return useMemo(
    () => ({
      ...collectionState,
      createAttendance: async (
        values: Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return createAttendance(values, writeContext);
      },
      updateAttendance: async (
        id: string,
        values: Partial<Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return updateAttendance(id, values, writeContext);
      },
      deleteAttendance: async (id: string) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return deleteAttendance(id, writeContext);
      },
    }),
    [collectionState, tenant, writeContext],
  );
}
