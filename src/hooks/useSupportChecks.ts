import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { SupportCheck } from "@/types/support";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";

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

export async function createSupportCheck(values: Omit<SupportCheck, "id" | "createdAt" | "updatedAt">) {
  const created = await addDoc(getSupportChecksCollection(), {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function updateSupportCheck(checkId: string, values: Partial<Omit<SupportCheck, "id" | "createdAt" | "updatedAt">>) {
  await updateDoc(getSupportCheckDoc(checkId), {
    ...values,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSupportCheck(checkId: string) {
  await deleteDoc(getSupportCheckDoc(checkId));
}

export function useSupportChecks() {
  const collectionState = useFirestoreCollection<SupportCheck>(SUPPORT_CHECKS_COLLECTION, demoSupportChecks, {
    orderByField: "month",
  });

  return {
    ...collectionState,
    createSupportCheck,
    updateSupportCheck,
    deleteSupportCheck,
  };
}
