"use client";

import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirebaseApp, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import {
  assertDemoPlatformIsolation,
  buildDemoPlatformBootstrap,
  getDemoLoginCredentials,
  type DemoLoginCredential,
  type DemoPlatformBootstrap,
  type DemoSchoolKey,
} from "@/lib/provision/bootstrapDemoPlatform";

export type BootstrapDemoPlatformResult = {
  ok: true;
  repaired: boolean;
  version: number;
  schoolTenantIds: string[];
  schoolNames: string[];
  schoolAdminUids: Record<DemoSchoolKey, string>;
  createdAuthUsers: number;
  documentCounts: Record<string, number>;
  loginCredentials: DemoLoginCredential[];
};

type CallableBootstrapResult = Omit<BootstrapDemoPlatformResult, "loginCredentials">;

/**
 * Calls the privileged Admin SDK bootstrap. No user creation, role assignment, or
 * demo writes happen in the browser.
 */
export async function bootstrapDemoPlatformInFirestore(opts?: {
  superAdminEmail?: string | null;
}): Promise<BootstrapDemoPlatformResult> {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");

  const callable = httpsCallable<Record<string, never>, CallableBootstrapResult>(
    getFunctions(getFirebaseApp(), "africa-south1"),
    "bootstrapDemoPlatform",
  );
  const response = await callable({});
  const result = response.data;
  if (!result?.ok) throw new Error("The demo platform did not return a successful result.");

  return {
    ...result,
    loginCredentials: getDemoLoginCredentials({
      superAdminEmail: opts?.superAdminEmail,
      schoolTenantIds: {
        brightfutures: result.schoolTenantIds[0],
        ubuntu: result.schoolTenantIds[1],
      },
    }),
  };
}

/** Pure preview for scripts / diagnostics (no network). */
export function previewDemoPlatformBootstrap(): DemoPlatformBootstrap {
  const bootstrap = buildDemoPlatformBootstrap({
    actorUserId: "user-super-admin-demo",
    nowIso: new Date().toISOString(),
  });
  assertDemoPlatformIsolation(bootstrap);
  return bootstrap;
}
