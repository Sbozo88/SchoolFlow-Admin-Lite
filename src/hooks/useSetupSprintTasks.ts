import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { SetupSprintTask, SetupSprintTaskStatus } from "@/types/setupSprint";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";

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

export async function createSetupSprintTask(values: Omit<SetupSprintTask, "id" | "createdAt" | "updatedAt">) {
  const created = await addDoc(getTasksCollection(), {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function updateSetupSprintTask(taskId: string, values: Partial<Omit<SetupSprintTask, "id" | "createdAt" | "updatedAt">>) {
  await updateDoc(getTaskDoc(taskId), {
    ...values,
    updatedAt: serverTimestamp(),
  });
}

export async function updateSetupSprintTaskStatus(taskId: string, status: SetupSprintTaskStatus) {
  await updateDoc(getTaskDoc(taskId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSetupSprintTask(taskId: string) {
  await deleteDoc(getTaskDoc(taskId));
}

export function useSetupSprintTasks() {
  const collectionState = useFirestoreCollection<SetupSprintTask>(SETUP_SPRINT_TASKS_COLLECTION, demoSetupSprintTasks, {
    orderByField: "day",
  });

  return {
    ...collectionState,
    createSetupSprintTask,
    updateSetupSprintTask,
    updateSetupSprintTaskStatus,
    deleteSetupSprintTask,
  };
}
