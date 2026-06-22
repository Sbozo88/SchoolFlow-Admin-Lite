import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { MissingInfoItem, MissingInfoStatus } from "@/types/setupSprint";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";

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

export async function createMissingInfoItem(values: Omit<MissingInfoItem, "id" | "createdAt" | "updatedAt">) {
  const created = await addDoc(getMissingInfoCollection(), {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function updateMissingInfoItem(itemId: string, values: Partial<Omit<MissingInfoItem, "id" | "createdAt" | "updatedAt">>) {
  await updateDoc(getMissingInfoDoc(itemId), {
    ...values,
    updatedAt: serverTimestamp(),
  });
}

export async function updateMissingInfoStatus(itemId: string, status: MissingInfoStatus) {
  await updateDoc(getMissingInfoDoc(itemId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMissingInfoItem(itemId: string) {
  await deleteDoc(getMissingInfoDoc(itemId));
}

export function useMissingInfoItems() {
  const collectionState = useFirestoreCollection<MissingInfoItem>(MISSING_INFO_COLLECTION, demoMissingInfo, {
    orderByField: "createdAt",
  });

  return {
    ...collectionState,
    createMissingInfoItem,
    updateMissingInfoItem,
    updateMissingInfoStatus,
    deleteMissingInfoItem,
  };
}
