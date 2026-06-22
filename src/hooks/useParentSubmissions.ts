import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentSnapshot,
} from "firebase/firestore";
import type { ParentSubmission, ParentSubmissionStatus } from "@/types/parentSubmission";
import { demoParentSubmissions } from "@/utils/seedData";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";

const SUBMISSIONS_COLLECTION = "parentSubmissions";

function getSubmissionsCollection() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  return collection(getFirebaseDb(), SUBMISSIONS_COLLECTION);
}

function getSubmissionDoc(submissionId: string) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  return doc(getFirebaseDb(), SUBMISSIONS_COLLECTION, submissionId);
}

function snapshotToSubmission(snapshot: DocumentSnapshot): ParentSubmission | null {
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...snapshot.data() } as ParentSubmission;
}

export async function getParentSubmissions() {
  const q = query(getSubmissionsCollection(), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ParentSubmission);
}

export async function getSubmissionById(submissionId: string) {
  return snapshotToSubmission(await getDoc(getSubmissionDoc(submissionId)));
}

export async function createSubmission(values: Omit<ParentSubmission, "id" | "createdAt" | "updatedAt" | "status">) {
  const created = await addDoc(getSubmissionsCollection(), {
    ...values,
    status: "new",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function updateSubmissionStatus(submissionId: string, status: ParentSubmissionStatus) {
  await updateDoc(getSubmissionDoc(submissionId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSubmission(submissionId: string) {
  await deleteDoc(getSubmissionDoc(submissionId));
}

export function useParentSubmissions() {
  const collectionState = useFirestoreCollection<ParentSubmission>(SUBMISSIONS_COLLECTION, demoParentSubmissions, {
    orderByField: "createdAt",
    orderDirection: "desc",
  });

  return {
    ...collectionState,
    createSubmission,
    updateSubmissionStatus,
    deleteSubmission,
    getSubmissionById,
    getParentSubmissions,
  };
}
