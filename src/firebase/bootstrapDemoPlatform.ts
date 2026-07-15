"use client";

import { doc, writeBatch, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import {
  assertDemoPlatformIsolation,
  assertFirestoreWriteSafe,
  buildDemoPlatformBootstrap,
  DEMO_SCHOOL_DEFINITIONS,
  getDemoLoginCredentials,
  stripUndefinedDeep,
  type DemoLoginCredential,
  type DemoPlatformBootstrap,
  type DemoSchoolKey,
} from "@/lib/provision/bootstrapDemoPlatform";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { buildAuditLogEntry } from "@/lib/audit/auditLog";
import { ensureDemoAuthUser } from "@/firebase/demoAuthUsers";

export type BootstrapDemoPlatformResult = {
  superAdminProfileId: string;
  superAdminEmail: string;
  schoolTenantIds: string[];
  schoolNames: string[];
  schoolAdminUids: Partial<Record<DemoSchoolKey, string>>;
  loginCredentials: DemoLoginCredential[];
  collectionsWritten: string[];
};

export type CurrentAuthUserInput = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
};

/**
 * Persist Super Admin (current Firebase user) + two demo schools + Auth logins + demo data.
 * Super Admin uses the signed-in operator's credentials — no separate demo password.
 */
export async function bootstrapDemoPlatformInFirestore(opts: {
  currentUser: CurrentAuthUserInput;
}): Promise<BootstrapDemoPlatformResult> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  if (!opts.currentUser?.uid) {
    throw new Error("Sign in with Firebase first. Super Admin uses your current login credentials.");
  }

  const currentUser = opts.currentUser;
  const actorUserId = currentUser.uid;
  const superAdminEmail = currentUser.email?.trim() || "unknown@signed-in.user";

  // Create/sign-in demo school Auth users without touching Super Admin session
  const schoolAdminUids: Partial<Record<DemoSchoolKey, string>> = {};
  for (const school of DEMO_SCHOOL_DEFINITIONS) {
    const ensured = await ensureDemoAuthUser(school.adminEmail, school.adminPassword);
    schoolAdminUids[school.key] = ensured.uid;
  }

  const bootstrap = buildDemoPlatformBootstrap({
    actorUserId,
    timestamps: firestoreTimestamps,
    superAdminProfileId: actorUserId,
    superAdminEmail,
    superAdminDisplayName: currentUser.displayName?.trim() || superAdminEmail.split("@")[0] || "Super Admin",
    linkedToCurrentAuth: true,
    schoolAdminUids,
  });
  assertDemoPlatformIsolation(bootstrap);
  assertFirestoreWriteSafe(bootstrap);

  await persistDemoPlatformBootstrap(bootstrap, {
    actorUserId,
    linkAuthUid: actorUserId,
    schoolAdminUids,
  });

  const loginCredentials = getDemoLoginCredentials({
    superAdminEmail,
    schoolTenantIds: {
      greenfield: bootstrap.schools[0]?.provision.tenantId,
      riverside: bootstrap.schools[1]?.provision.tenantId,
    },
  });

  return {
    superAdminProfileId: actorUserId,
    superAdminEmail,
    schoolTenantIds: bootstrap.schools.map((s) => s.provision.tenantId),
    schoolNames: bootstrap.schools.map((s) => s.definition.organizationName),
    schoolAdminUids,
    loginCredentials,
    collectionsWritten: [
      "users",
      "tenants",
      "organizationSettings",
      "tenantSubscriptions",
      "tenantRoles",
      "invitations",
      "learners",
      "attendance",
      "payments",
      "parentSubmissions",
      "recentActivity",
      "auditLogs",
    ],
  };
}

export async function persistDemoPlatformBootstrap(
  bootstrap: DemoPlatformBootstrap,
  opts: {
    actorUserId: string;
    linkAuthUid?: string;
    schoolAdminUids?: Partial<Record<DemoSchoolKey, string>>;
  },
): Promise<void> {
  const db = getFirebaseDb();
  const batch = writeBatch(db);

  const superAdminId = opts.linkAuthUid ?? bootstrap.superAdmin.id;
  // Super Admin must never keep a school role/tenant — forces platform workspace after load
  batch.set(
    doc(db, "users", superAdminId),
    stripUndefinedDeep({
      email: bootstrap.superAdmin.email,
      displayName: bootstrap.superAdmin.displayName,
      organizationName: "SchoolFlow Platform",
      status: "active",
      id: superAdminId,
      platformRole: "super_admin",
      role: null,
      tenantId: null,
      isPlatformOnly: true,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      createdBy: opts.actorUserId,
    }),
    { merge: true },
  );

  for (const school of bootstrap.schools) {
    const { provision, demo, definition } = school;
    batch.set(
      doc(db, "tenants", provision.tenantId),
      stripUndefinedDeep({
        ...provision.tenant,
        id: provision.tenantId,
      }),
    );
    batch.set(
      doc(db, "organizationSettings", `${provision.tenantId}_main`),
      stripUndefinedDeep({
        ...provision.settings,
        id: `${provision.tenantId}_main`,
      }),
    );
    batch.set(
      doc(db, "tenantSubscriptions", provision.subscription.id as string),
      stripUndefinedDeep(provision.subscription),
    );
    batch.set(
      doc(db, "invitations", provision.invitation.id as string),
      stripUndefinedDeep(provision.invitation),
    );

    for (const role of provision.roles) {
      batch.set(doc(db, "tenantRoles", role.id as string), stripUndefinedDeep(role));
    }

    // School admin user profile on real Auth uid when available
    const adminUid =
      opts.schoolAdminUids?.[definition.key] ??
      (typeof provision.adminProfile.id === "string" ? provision.adminProfile.id : null);

    if (adminUid && !String(adminUid).startsWith("pending-")) {
      batch.set(
        doc(db, "users", adminUid),
        stripUndefinedDeep({
          ...provision.adminProfile,
          id: adminUid,
          email: definition.adminEmail,
          displayName: definition.adminDisplayName,
          role: "client_admin",
          platformRole: null,
          tenantId: provision.tenantId,
          status: "active",
          organizationName: definition.organizationName,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          createdBy: opts.actorUserId,
        }),
        { merge: true },
      );
    } else {
      batch.set(
        doc(db, "pendingAdmins", provision.adminProfile.id as string),
        stripUndefinedDeep(provision.adminProfile),
      );
    }

    for (const learner of demo.learners) {
      batch.set(doc(db, "learners", learner.id), stripUndefinedDeep(learner));
    }
    for (const row of demo.attendance) {
      batch.set(doc(db, "attendance", row.id), stripUndefinedDeep(row));
    }
    for (const row of demo.payments) {
      batch.set(doc(db, "payments", row.id), stripUndefinedDeep(row));
    }
    for (const row of demo.parentSubmissions) {
      batch.set(doc(db, "parentSubmissions", row.id), stripUndefinedDeep(row));
    }
    for (const row of demo.recentActivity) {
      batch.set(doc(db, "recentActivity", row.id), stripUndefinedDeep(row));
    }
  }

  await batch.commit();

  const audit = buildAuditLogEntry({
    userId: opts.actorUserId,
    action: "client.create",
    tenantId: null,
    detail: `Demo platform bootstrap: Super Admin (current user) + ${bootstrap.schools.map((s) => s.definition.organizationName).join(" & ")}`,
    meta: {
      schoolTenantIds: bootstrap.schools.map((s) => s.provision.tenantId),
      schoolAdminUids: opts.schoolAdminUids,
    },
  });
  await addDoc(collection(db, "auditLogs"), {
    ...audit,
    createdAt: serverTimestamp(),
  });
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
