import { serverTimestamp } from "firebase/firestore";
import type { TimestampProvider } from "@/lib/tenant/stamp";

export const firestoreTimestamps: TimestampProvider = {
  now: () => serverTimestamp(),
};

export const isoTimestamps: TimestampProvider = {
  now: () => new Date().toISOString(),
};
