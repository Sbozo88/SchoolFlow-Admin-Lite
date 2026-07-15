import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import type { HandoverTask, HandoverTaskStatus } from "@/types/handover";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { stampTenantCreate, stampTenantUpdate } from "@/lib/tenant/stamp";
import { assertSameTenant } from "@/lib/tenant/filter";
import type { TenantWriteContext } from "@/lib/tenant/types";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { useMemo } from "react";

const HANDOVER_TASKS_COLLECTION = "handoverTasks";

const demoHandoverTasks: HandoverTask[] = [
  {
    id: "task-1",
    term: "Term 2",
    title: "Archive Term 2 Data",
    description: "Archive all attendance and grades for Term 2.",
    status: "Pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task-2",
    term: "Term 2",
    title: "Generate Report Cards",
    description: "Finalize and distribute report cards.",
    status: "Pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function getTasksCollection() {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return collection(getFirebaseDb(), HANDOVER_TASKS_COLLECTION);
}

function getTaskDoc(taskId: string) {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return doc(getFirebaseDb(), HANDOVER_TASKS_COLLECTION, taskId);
}

export async function createHandoverTask(
  values: Omit<HandoverTask, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
  ctx: TenantWriteContext,
) {
  const created = await addDoc(
    getTasksCollection(),
    stampTenantCreate({ ...values }, ctx, firestoreTimestamps),
  );
  return created.id;
}

export async function updateHandoverTask(
  taskId: string,
  values: Partial<Omit<HandoverTask, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
  ctx: TenantWriteContext,
) {
  const existing = await getDoc(getTaskDoc(taskId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "update task");
  await updateDoc(getTaskDoc(taskId), stampTenantUpdate({ ...values }, firestoreTimestamps));
}

export async function updateHandoverTaskStatus(
  taskId: string,
  status: HandoverTaskStatus,
  ctx: TenantWriteContext,
) {
  const existing = await getDoc(getTaskDoc(taskId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "update task status");
  await updateDoc(getTaskDoc(taskId), stampTenantUpdate({ status }, firestoreTimestamps));
}

export async function deleteHandoverTask(taskId: string, ctx: TenantWriteContext) {
  const existing = await getDoc(getTaskDoc(taskId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "delete task");
  await deleteDoc(getTaskDoc(taskId));
}

export function useHandoverTasks() {
  const tenant = useOptionalTenant();
  const tenantId = tenant?.activeTenantId ?? null;
  const writeContext = tenant?.writeContext ?? null;

  const collectionState = useFirestoreCollection<HandoverTask>(
    HANDOVER_TASKS_COLLECTION,
    demoHandoverTasks,
    { orderByField: "createdAt", tenantId },
  );

  return useMemo(
    () => ({
      ...collectionState,
      createHandoverTask: async (
        values: Omit<HandoverTask, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        return createHandoverTask(values, writeContext);
      },
      updateHandoverTask: async (
        taskId: string,
        values: Partial<Omit<HandoverTask, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        return updateHandoverTask(taskId, values, writeContext);
      },
      updateHandoverTaskStatus: async (taskId: string, status: HandoverTaskStatus) => {
        if (!writeContext) throw new Error("No tenant write context");
        return updateHandoverTaskStatus(taskId, status, writeContext);
      },
      deleteHandoverTask: async (taskId: string) => {
        if (!writeContext) throw new Error("No tenant write context");
        return deleteHandoverTask(taskId, writeContext);
      },
      toggleHandoverTask: async (taskId: string) => {
        if (!writeContext) throw new Error("No tenant write context");
        const task = collectionState.records.find(t => t.id === taskId);
        if (!task) return;
        return updateHandoverTaskStatus(taskId, task.status === "Pending" ? "Done" : "Pending", writeContext);
      }
    }),
    [collectionState, writeContext],
  );
}
