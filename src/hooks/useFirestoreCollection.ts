"use client";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type OrderByDirection,
} from "firebase/firestore";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";

type FirestoreCollectionOptions = {
  orderByField?: string;
  orderDirection?: OrderByDirection;
};

type FirestoreCollectionState<T> = {
  records: T[];
  setRecords: Dispatch<SetStateAction<T[]>>;
  syncState: string;
  errorMessage: string;
  isConfigured: boolean;
  isLive: boolean;
};

export function useFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  fallbackRecords: T[],
  options: FirestoreCollectionOptions = {},
): FirestoreCollectionState<T> {
  const isConfigured = isFirebaseConfigured();
  const [records, setRecords] = useState<T[]>(() => (isConfigured ? [] : fallbackRecords));
  const [syncState, setSyncState] = useState(() => (isConfigured ? "Connecting to Firestore" : "Firebase not configured"));
  const [errorMessage, setErrorMessage] = useState("");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      return undefined;
    }

    const db = getFirebaseDb();
    const constraints = options.orderByField ? [orderBy(options.orderByField, options.orderDirection ?? "asc")] : [];
    const collectionQuery = query(collection(db, collectionName), ...constraints);

    return onSnapshot(
      collectionQuery,
      (snapshot) => {
        setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T));
        setSyncState("Firestore connected");
        setErrorMessage("");
        setIsLive(true);
      },
      () => {
        setSyncState("Firestore unavailable");
        setErrorMessage("Live data could not be loaded. Check Firebase access, Firestore rules, and the admin role document.");
        setIsLive(false);
      },
    );
  }, [collectionName, isConfigured, options.orderByField, options.orderDirection]);

  return { records, setRecords, syncState, errorMessage, isConfigured, isLive };
}
