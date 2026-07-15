"use client";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type OrderByDirection,
} from "firebase/firestore";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { tenantQueryConstraint } from "@/lib/tenant/filter";

type FirestoreCollectionOptions = {
  orderByField?: string;
  orderDirection?: OrderByDirection;
  /** When set, all reads are automatically scoped to this tenant. */
  tenantId?: string | null;
  /** Skip tenant filter (platform-wide collections only). */
  skipTenantFilter?: boolean;
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
  const tenantId = options.tenantId;
  const skipTenantFilter = options.skipTenantFilter === true;
  const waitingForTenant = !skipTenantFilter && !tenantId;

  const [records, setRecords] = useState<T[]>(() => (isConfigured ? [] : fallbackRecords));
  const [syncState, setSyncState] = useState(() => {
    if (!isConfigured) return "Firebase not configured";
    if (waitingForTenant) return "Waiting for tenant context";
    return "Connecting to Firestore";
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      return undefined;
    }

    if (waitingForTenant) {
      return undefined;
    }

    const db = getFirebaseDb();
    const constraints = [];

    if (!skipTenantFilter && tenantId) {
      const tq = tenantQueryConstraint(tenantId);
      constraints.push(where(tq.field, tq.op, tq.value));
    }

    if (options.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection ?? "asc"));
    }

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
        setErrorMessage(
          "Live data could not be loaded. Check Firebase access, Firestore rules, tenant membership, and indexes.",
        );
        setIsLive(false);
      },
    );
  }, [
    collectionName,
    isConfigured,
    options.orderByField,
    options.orderDirection,
    skipTenantFilter,
    tenantId,
    waitingForTenant,
  ]);

  // Derive empty state when waiting for tenant without setState-in-effect
  const effectiveRecords = waitingForTenant ? [] : records;
  const effectiveSync = waitingForTenant ? "Waiting for tenant context" : syncState;
  const effectiveLive = waitingForTenant ? false : isLive;

  return {
    records: effectiveRecords,
    setRecords,
    syncState: effectiveSync,
    errorMessage: waitingForTenant ? "" : errorMessage,
    isConfigured,
    isLive: effectiveLive,
  };
}
