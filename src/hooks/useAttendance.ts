import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { AttendanceRecord } from "@/types/attendance";
import { demoAttendance } from "@/utils/seedData";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";

const ATTENDANCE_COLLECTION = "attendance";

function getAttendanceCollection() {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return collection(getFirebaseDb(), ATTENDANCE_COLLECTION);
}

function getAttendanceDoc(id: string) {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return doc(getFirebaseDb(), ATTENDANCE_COLLECTION, id);
}

export async function createAttendance(values: Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt">) {
  const created = await addDoc(getAttendanceCollection(), {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function updateAttendance(id: string, values: Partial<Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt">>) {
  await updateDoc(getAttendanceDoc(id), {
    ...values,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAttendance(id: string) {
  await deleteDoc(getAttendanceDoc(id));
}

export function useAttendance() {
  const collectionState = useFirestoreCollection<AttendanceRecord>(ATTENDANCE_COLLECTION, demoAttendance, {
    orderByField: "date",
    orderDirection: "desc",
  });

  return {
    ...collectionState,
    createAttendance,
    updateAttendance,
    deleteAttendance,
  };
}
