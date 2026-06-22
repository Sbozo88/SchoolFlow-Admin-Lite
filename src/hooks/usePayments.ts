import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { PaymentRecord } from "@/types/payment";
import { demoPayments } from "@/utils/seedData";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";

const PAYMENTS_COLLECTION = "payments";

function getPaymentsCollection() {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return collection(getFirebaseDb(), PAYMENTS_COLLECTION);
}

function getPaymentDoc(id: string) {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return doc(getFirebaseDb(), PAYMENTS_COLLECTION, id);
}

export async function createPayment(values: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">) {
  const created = await addDoc(getPaymentsCollection(), {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function updatePayment(id: string, values: Partial<Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">>) {
  await updateDoc(getPaymentDoc(id), {
    ...values,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePayment(id: string) {
  await deleteDoc(getPaymentDoc(id));
}

export function usePayments() {
  const collectionState = useFirestoreCollection<PaymentRecord>(PAYMENTS_COLLECTION, demoPayments, {
    orderByField: "month",
    orderDirection: "desc",
  });

  return {
    ...collectionState,
    createPayment,
    updatePayment,
    deletePayment,
  };
}
