"use client";

import { doc, writeBatch, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { buildTenantProvision, type ProvisionClientInput } from "@/lib/provision/provisionTenant";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { buildAuditLogEntry } from "@/lib/audit/auditLog";

/**
 * Persist a full tenant provision pack in one batch.
 * Admin Auth account creation remains future-ready (invitation profile only).
 */
export async function provisionClientInFirestore(
  input: ProvisionClientInput,
  actorUserId: string,
): Promise<{ tenantId: string }> {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  const pack = buildTenantProvision(input, actorUserId, firestoreTimestamps);
  const db = getFirebaseDb();
  const batch = writeBatch(db);

  batch.set(doc(db, "tenants", pack.tenantId), pack.tenant);
  batch.set(doc(db, "organizationSettings", `${pack.tenantId}_main`), pack.settings);
  batch.set(doc(db, "tenantSubscriptions", pack.subscription.id as string), pack.subscription);
  batch.set(doc(db, "invitations", pack.invitation.id as string), pack.invitation);

  for (const role of pack.roles) {
    batch.set(doc(db, "tenantRoles", role.id as string), role);
  }

  // Admin profile: if real uid provided, write users/{uid}; else invitations only
  if (input.adminUid) {
    batch.set(doc(db, "users", input.adminUid), pack.adminProfile, { merge: true });
  } else {
    batch.set(doc(db, "pendingAdmins", pack.adminProfile.id as string), pack.adminProfile);
  }

  await batch.commit();

  const audit = buildAuditLogEntry({
    userId: actorUserId,
    action: "client.create",
    tenantId: pack.tenantId,
    detail: `Created tenant ${input.organizationName}`,
  });
  await addDoc(collection(db, "auditLogs"), {
    ...audit,
    createdAt: serverTimestamp(),
  });

  return { tenantId: pack.tenantId };
}
