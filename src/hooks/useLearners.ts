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
import type { Learner } from "@/types/learner";
import { demoLearners } from "@/utils/seedData";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import type { LearnerFormValues } from "@/types/learner";

const LEARNERS_COLLECTION = "learners";

function cleanOptional(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toLearnerPayload(values: LearnerFormValues) {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    className: values.className.trim(),
    programme: values.programme.trim(),
    instrumentOrActivity: values.instrumentOrActivity.trim(),
    parentName: values.parentName.trim(),
    parentPhone: values.parentPhone.trim(),
    parentEmail: cleanOptional(values.parentEmail),
    paymentStatus: values.paymentStatus,
    learnerStatus: values.learnerStatus,
    notes: cleanOptional(values.notes),
  };
}

function getLearnersCollection() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }

  return collection(getFirebaseDb(), LEARNERS_COLLECTION);
}

function getLearnerDoc(learnerId: string) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }

  return doc(getFirebaseDb(), LEARNERS_COLLECTION, learnerId);
}

function snapshotToLearner(snapshot: DocumentSnapshot): Learner | null {
  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as Learner;
}

export async function getLearners() {
  const learnersQuery = query(getLearnersCollection(), orderBy("lastName", "asc"));
  const snapshot = await getDocs(learnersQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Learner);
}

export async function getLearnerById(learnerId: string) {
  return snapshotToLearner(await getDoc(getLearnerDoc(learnerId)));
}

export async function createLearner(values: LearnerFormValues) {
  const created = await addDoc(getLearnersCollection(), {
    ...toLearnerPayload(values),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return created.id;
}

export async function updateLearner(learnerId: string, values: LearnerFormValues) {
  await updateDoc(getLearnerDoc(learnerId), {
    ...toLearnerPayload(values),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteLearner(learnerId: string) {
  await deleteDoc(getLearnerDoc(learnerId));
}

export function useLearners() {
  const collectionState = useFirestoreCollection<Learner>(LEARNERS_COLLECTION, demoLearners, {
    orderByField: "lastName",
  });

  return {
    ...collectionState,
    createLearner,
    updateLearner,
    deleteLearner,
    getLearnerById,
    getLearners,
  };
}
