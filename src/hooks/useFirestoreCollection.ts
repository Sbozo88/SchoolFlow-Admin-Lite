"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { OrderByDirection } from "firebase/firestore";
import { isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { subscribeLiveQuery } from "@/lib/data/liveQueryHub";
import { DEFAULT_COLLECTION_LIMIT } from "@/lib/data/queryLimits";
import { notDeleted } from "@/lib/data/notDeleted";

type FirestoreCollectionOptions = {
  orderByField?: string;
  orderDirection?: OrderByDirection;
  /** When set, all reads are automatically scoped to this tenant. */
  tenantId?: string | null;
  /** Skip tenant filter (platform-wide collections only). */
  skipTenantFilter?: boolean;
  /** Max docs to listen to (default DEFAULT_COLLECTION_LIMIT). */
  limitCount?: number;
  /** Hide soft-deleted rows (default true). */
  excludeDeleted?: boolean;
};

type FirestoreCollectionState<T> = {
  records: T[];
  setRecords: Dispatch<SetStateAction<T[]>>;
  syncState: string;
  errorMessage: string;
  isConfigured: boolean;
  isLive: boolean;
};

export function useFirestoreCollection<T extends { id: string; status?: string }>(
  collectionName: string,
  fallbackRecords: T[],
  options: FirestoreCollectionOptions = {},
): FirestoreCollectionState<T> {
  const isConfigured = isFirebaseConfigured();
  const tenantId = options.tenantId;
  const skipTenantFilter = options.skipTenantFilter === true;
  const waitingForTenant = !skipTenantFilter && !tenantId;
  const excludeDeleted = options.excludeDeleted !== false;
  const limitCount = options.limitCount ?? DEFAULT_COLLECTION_LIMIT;

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecords([]);
       
      setIsLive(false);
       
      setSyncState("Waiting for tenant context");
      return undefined;
    }

    return subscribeLiveQuery<T>(
      collectionName,
      tenantId ?? null,
      {
        orderByField: options.orderByField,
        orderDirection: options.orderDirection,
        limitCount,
        skipTenantFilter,
      },
      (rows) => {
        setRecords(rows);
        setSyncState("Firestore connected");
        setErrorMessage("");
        setIsLive(true);
      },
      (message) => {
        setSyncState("Firestore unavailable");
        setErrorMessage(message);
        setIsLive(false);
      },
    );
  }, [
    collectionName,
    isConfigured,
    limitCount,
    options.orderByField,
    options.orderDirection,
    skipTenantFilter,
    tenantId,
    waitingForTenant,
  ]);

  const visible = excludeDeleted ? notDeleted(records) : records;
  const effectiveRecords = waitingForTenant ? [] : visible;
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
