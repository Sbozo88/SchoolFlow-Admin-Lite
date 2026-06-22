import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import type { RecentActivity, ActivityType } from "@/types/activity";
import { demoRecentActivity } from "@/utils/seedData";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";

const ACTIVITY_COLLECTION = "recentActivity";

function getActivityCollection() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  return collection(getFirebaseDb(), ACTIVITY_COLLECTION);
}

export async function createActivity(payload: {
  type: ActivityType;
  title: string;
  description: string;
  link?: string;
}) {
  const created = await addDoc(getActivityCollection(), {
    ...payload,
    timestamp: serverTimestamp(),
  });
  return created.id;
}

export async function getRecentActivity(maxCount = 20) {
  const q = query(getActivityCollection(), orderBy("timestamp", "desc"), limit(maxCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as RecentActivity);
}

export function useRecentActivity() {
  const collectionState = useFirestoreCollection<RecentActivity>(ACTIVITY_COLLECTION, demoRecentActivity, {
    orderByField: "timestamp",
    orderDirection: "desc",
  });

  return {
    ...collectionState,
    createActivity,
    getRecentActivity,
  };
}
