import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import {
  normalizePlatformRole,
  normalizeTenantRole,
  type PlatformRole,
  type TenantRole,
} from "@/lib/permissions/roles";
import type { SubscriptionStatus } from "@/lib/tenant/types";

export type UserProfile = {
  id: string;
  email?: string;
  displayName?: string;
  role: TenantRole | null;
  platformRole: PlatformRole | null;
  tenantId: string | null;
  organizationName?: string;
  subscriptionStatus?: SubscriptionStatus | null;
  status?: string;
};

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  const snapshot = await getDoc(doc(getFirebaseDb(), "users", uid));
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.data();
  return {
    id: snapshot.id,
    email: data.email,
    displayName: data.displayName,
    role: normalizeTenantRole(data.role),
    platformRole: normalizePlatformRole(data.platformRole),
    tenantId: typeof data.tenantId === "string" ? data.tenantId : null,
    organizationName: data.organizationName,
    subscriptionStatus: data.subscriptionStatus ?? null,
    status: data.status,
  };
}
