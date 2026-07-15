import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  QueryConstraint,
  DocumentData,
  WithFieldValue,
  UpdateData,
} from "firebase/firestore";
import { getFirebaseDb } from "@/firebase/firebaseConfig";
import { BaseDocument } from "@/types/base";

export abstract class BaseRepository<T extends BaseDocument> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get db() {
    return getFirebaseDb();
  }

  protected get collectionRef() {
    return collection(this.db, this.collectionName);
  }

  async getById(id: string): Promise<T | null> {
    const docRef = doc(this.collectionRef, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as T;
  }

  async query(constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(this.collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  }

  async create(data: WithFieldValue<Omit<T, "id">>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, data);
    return docRef.id;
  }

  async update(id: string, data: UpdateData<T>): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    await updateDoc(docRef, data as DocumentData);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    // Soft delete is preferred in production SaaS, but we provide raw delete here.
    await deleteDoc(docRef);
  }
}
