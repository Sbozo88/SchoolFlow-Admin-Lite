import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";
import type { RecentActivity, ActivityType } from "@/types/activity";
import { demoRecentActivity } from "@/utils/seedData";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { stampTenantCreate } from "@/lib/tenant/stamp";
import { tenantQueryConstraint } from "@/lib/tenant/filter";
import type { TenantWriteContext } from "@/lib/tenant/types";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { useMemo } from "react";
import { ACTIVITY_FEED_LIMIT } from "@/lib/data/queryLimits";

const ACTIVITY_COLLECTION = "recentActivity";

function getActivityCollection() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  return collection(getFirebaseDb(), ACTIVITY_COLLECTION);
}

export async function createActivity(
  payload: {
    type: ActivityType;
    title: string;
    description: string;
    link?: string;
  },
  ctx: TenantWriteContext,
) {
  const created = await addDoc(
    getActivityCollection(),
    stampTenantCreate(
      {
        ...payload,
        timestamp: firestoreTimestamps.now(),
      },
      ctx,
      firestoreTimestamps,
    ),
  );
  return created.id;
}

export async function getRecentActivity(tenantId: string, maxCount = 20) {
  const tq = tenantQueryConstraint(tenantId);
  const q = query(
    getActivityCollection(),
    where(tq.field, tq.op, tq.value),
    orderBy("timestamp", "desc"),
    limit(maxCount),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as RecentActivity);
}

export function useRecentActivity() {
  const tenant = useOptionalTenant();
  const tenantId = tenant?.activeTenantId ?? null;
  const writeContext = tenant?.writeContext ?? null;

  const collectionState = useFirestoreCollection<RecentActivity>(ACTIVITY_COLLECTION, demoRecentActivity, {
    orderByField: "timestamp",
    orderDirection: "desc",
    tenantId,
    limitCount: ACTIVITY_FEED_LIMIT,
  });

  return useMemo(
    () => ({
      ...collectionState,
      createActivity: async (payload: {
        type: ActivityType;
        title: string;
        description: string;
        link?: string;
      }) => {
        if (!writeContext) throw new Error("No tenant write context");
        return createActivity(payload, writeContext);
      },
      getRecentActivity: (maxCount = 20) => {
        if (!tenantId) throw new Error("No active tenant");
        return getRecentActivity(tenantId, maxCount);
      },
    }),
    [collectionState, tenantId, writeContext],
  );
}
