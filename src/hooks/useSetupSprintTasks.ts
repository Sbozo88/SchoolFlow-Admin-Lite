import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import type { SetupSprintTask, SetupSprintTaskStatus } from "@/types/setupSprint";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { stampTenantCreate, stampTenantUpdate } from "@/lib/tenant/stamp";
import { assertSameTenant } from "@/lib/tenant/filter";
import type { TenantWriteContext } from "@/lib/tenant/types";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { useMemo } from "react";

const SETUP_SPRINT_TASKS_COLLECTION = "setupSprintTasks";

const demoSetupSprintTasks: SetupSprintTask[] = [
  {
    id: "task-1",
    day: 1,
    title: "collect learner list",
    status: "done",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task-2",
    day: 1,
    title: "collect parent contacts",
    status: "in_progress",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function getTasksCollection() {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return collection(getFirebaseDb(), SETUP_SPRINT_TASKS_COLLECTION);
}

function getTaskDoc(taskId: string) {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return doc(getFirebaseDb(), SETUP_SPRINT_TASKS_COLLECTION, taskId);
}

export async function createSetupSprintTask(
  values: Omit<SetupSprintTask, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
  ctx: TenantWriteContext,
) {
  const created = await addDoc(
    getTasksCollection(),
    stampTenantCreate({ ...values }, ctx, firestoreTimestamps),
  );
  return created.id;
}

export async function updateSetupSprintTask(
  taskId: string,
  values: Partial<Omit<SetupSprintTask, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
  ctx: TenantWriteContext,
) {
  const existing = await getDoc(getTaskDoc(taskId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "update task");
  await updateDoc(getTaskDoc(taskId), stampTenantUpdate({ ...values }, firestoreTimestamps));
}

export async function updateSetupSprintTaskStatus(
  taskId: string,
  status: SetupSprintTaskStatus,
  ctx: TenantWriteContext,
) {
  const existing = await getDoc(getTaskDoc(taskId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "update task status");
  await updateDoc(getTaskDoc(taskId), stampTenantUpdate({ status }, firestoreTimestamps));
}

export async function deleteSetupSprintTask(taskId: string, ctx: TenantWriteContext) {
  const existing = await getDoc(getTaskDoc(taskId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "delete task");
  await deleteDoc(getTaskDoc(taskId));
}

export function useSetupSprintTasks() {
  const tenant = useOptionalTenant();
  const tenantId = tenant?.activeTenantId ?? null;
  const writeContext = tenant?.writeContext ?? null;

  const collectionState = useFirestoreCollection<SetupSprintTask>(
    SETUP_SPRINT_TASKS_COLLECTION,
    demoSetupSprintTasks,
    { orderByField: "day", tenantId },
  );

  return useMemo(
    () => ({
      ...collectionState,
      createSetupSprintTask: async (
        values: Omit<SetupSprintTask, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        return createSetupSprintTask(values, writeContext);
      },
      updateSetupSprintTask: async (
        taskId: string,
        values: Partial<Omit<SetupSprintTask, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        return updateSetupSprintTask(taskId, values, writeContext);
      },
      updateSetupSprintTaskStatus: async (taskId: string, status: SetupSprintTaskStatus) => {
        if (!writeContext) throw new Error("No tenant write context");
        return updateSetupSprintTaskStatus(taskId, status, writeContext);
      },
      deleteSetupSprintTask: async (taskId: string) => {
        if (!writeContext) throw new Error("No tenant write context");
        return deleteSetupSprintTask(taskId, writeContext);
      },
    }),
    [collectionState, writeContext],
  );
}
