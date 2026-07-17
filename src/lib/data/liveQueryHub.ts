/**
 * Shared Firestore live query hub — one onSnapshot per (collection, tenant, options)
 * so dashboard + list pages do not open duplicate listeners.
 */
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type OrderByDirection,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { tenantQueryConstraint } from "@/lib/tenant/filter";
import { DEFAULT_COLLECTION_LIMIT } from "@/lib/data/queryLimits";

export type LiveQueryOptions = {
  orderByField?: string;
  orderDirection?: OrderByDirection;
  limitCount?: number;
  skipTenantFilter?: boolean;
};

type HubListener<T> = {
  onData: (rows: T[]) => void;
  onError: (message: string) => void;
};

type HubEntry = {
  key: string;
  unsub: Unsubscribe | null;
  listeners: Set<HubListener<unknown>>;
  lastRows: unknown[] | null;
  lastError: string | null;
};

const hubs = new Map<string, HubEntry>();

function hubKey(collectionName: string, tenantId: string | null, options: LiveQueryOptions): string {
  return [
    collectionName,
    options.skipTenantFilter ? "platform" : tenantId ?? "none",
    options.orderByField ?? "",
    options.orderDirection ?? "asc",
    String(options.limitCount ?? DEFAULT_COLLECTION_LIMIT),
  ].join("|");
}

function ensureHub(collectionName: string, tenantId: string | null, options: LiveQueryOptions): HubEntry {
  const key = hubKey(collectionName, tenantId, options);
  let entry = hubs.get(key);
  if (entry) return entry;

  entry = { key, unsub: null, listeners: new Set(), lastRows: null, lastError: null };
  hubs.set(key, entry);

  if (!isFirebaseConfigured()) {
    entry.lastError = "Firebase not configured";
    return entry;
  }
  if (!options.skipTenantFilter && !tenantId) {
    entry.lastError = "Waiting for tenant context";
    return entry;
  }

  const db = getFirebaseDb();
  const constraints = [];
  if (!options.skipTenantFilter && tenantId) {
    const tq = tenantQueryConstraint(tenantId);
    constraints.push(where(tq.field, tq.op, tq.value));
  }
  if (options.orderByField) {
    constraints.push(orderBy(options.orderByField, options.orderDirection ?? "asc"));
  }
  constraints.push(limit(options.limitCount ?? DEFAULT_COLLECTION_LIMIT));

  const q = query(collection(db, collectionName), ...constraints);
  entry.unsub = onSnapshot(
    q,
    (snapshot) => {
      const rows = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      entry!.lastRows = rows;
      entry!.lastError = null;
      for (const listener of entry!.listeners) {
        listener.onData(rows);
      }
    },
    () => {
      const message =
        "Live data could not be loaded. Check Firebase access, Firestore rules, tenant membership, and indexes.";
      entry!.lastError = message;
      for (const listener of entry!.listeners) {
        listener.onError(message);
      }
    },
  );

  return entry;
}

function releaseHub(entry: HubEntry) {
  if (entry.listeners.size > 0) return;
  entry.unsub?.();
  hubs.delete(entry.key);
}

export function subscribeLiveQuery<T extends { id: string }>(
  collectionName: string,
  tenantId: string | null,
  options: LiveQueryOptions,
  onData: (rows: T[]) => void,
  onError: (message: string) => void,
): () => void {
  const entry = ensureHub(collectionName, tenantId, options);
  const listener: HubListener<unknown> = {
    onData: (rows) => onData(rows as T[]),
    onError,
  };
  entry.listeners.add(listener);

  if (entry.lastRows) {
    onData(entry.lastRows as T[]);
  } else if (entry.lastError) {
    onError(entry.lastError);
  }

  return () => {
    entry.listeners.delete(listener);
    releaseHub(entry);
  };
}

/** Test / diagnostics helper */
export function liveQueryHubSize(): number {
  return hubs.size;
}
