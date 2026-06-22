import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { FollowUp } from "@/types/followUp";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";

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
    message: "Good day Thandi Dlamini, hope you are well. Kindly note that Zara Dlamini was absent from Dance Foundations on 2026-05-26. Please confirm if everything is okay. Thank you.",
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

export async function createFollowUp(values: Omit<FollowUp, "id" | "createdAt" | "updatedAt">) {
  const created = await addDoc(getFollowUpsCollection(), {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function updateFollowUp(followUpId: string, values: Partial<Omit<FollowUp, "id" | "createdAt" | "updatedAt">>) {
  await updateDoc(getFollowUpDoc(followUpId), {
    ...values,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFollowUp(followUpId: string) {
  await deleteDoc(getFollowUpDoc(followUpId));
}

export function useFollowUps() {
  const collectionState = useFirestoreCollection<FollowUp>(FOLLOW_UPS_COLLECTION, demoFollowUps, {
    orderByField: "createdAt",
  });

  return {
    ...collectionState,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
  };
}
