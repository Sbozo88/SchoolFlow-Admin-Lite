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
  orderBy,
  limit,
  type QueryConstraint,
  type DocumentData,
  type WithFieldValue,
  type UpdateData,
  type OrderByDirection,
} from "firebase/firestore";
import { getFirebaseDb } from "@/firebase/firebaseConfig";
import { BaseDocument } from "@/types/base";
import { DEFAULT_COLLECTION_LIMIT } from "@/lib/data/queryLimits";

export type QueryOptions = {
  constraints?: QueryConstraint[];
  orderByField?: string;
  orderDirection?: OrderByDirection;
  limitCount?: number;
};

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

  async query(constraintsOrOptions: QueryConstraint[] | QueryOptions = []): Promise<T[]> {
    const options: QueryOptions = Array.isArray(constraintsOrOptions)
      ? { constraints: constraintsOrOptions }
      : constraintsOrOptions;

    const constraints: QueryConstraint[] = [...(options.constraints ?? [])];
    if (options.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection ?? "asc"));
    }
    constraints.push(limit(options.limitCount ?? DEFAULT_COLLECTION_LIMIT));

    const q = query(this.collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
  }

  async create(data: WithFieldValue<Omit<T, "id">>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, data);
    return docRef.id;
  }

  async update(id: string, data: UpdateData<T>): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    await updateDoc(docRef, data as DocumentData);
  }

  /** Hard delete — prefer softDelete on TenantRepository for operational data. */
  async delete(id: string): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    await deleteDoc(docRef);
  }
}

export { where, orderBy, limit };
