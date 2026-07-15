"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { buildAuditLogEntry, type AuditAction } from "@/lib/audit/auditLog";

export async function writeAuditLog(input: {
  userId: string;
  action: AuditAction;
  tenantId?: string | null;
  detail?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const entry = buildAuditLogEntry(input);
  try {
    await addDoc(collection(getFirebaseDb(), "auditLogs"), {
      ...entry,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Non-blocking: audit must not break primary UX
  }
}
