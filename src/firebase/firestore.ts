import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseDb } from "@/firebase/firebaseConfig";

export async function getDocument<T extends DocumentData>(collectionName: string, id: string) {
  const snapshot = await getDoc(doc(getFirebaseDb(), collectionName, id));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T & { id: string }) : null;
}

export async function getCollection<T extends DocumentData>(collectionName: string, constraints: QueryConstraint[] = []) {
  const snapshot = await getDocs(query(collection(getFirebaseDb(), collectionName), ...constraints, limit(100)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T & { id: string });
}
