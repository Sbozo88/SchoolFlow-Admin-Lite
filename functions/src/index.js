import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { DEMO_PASSWORD, DEMO_SCHOOLS, buildDemoDocuments, evaluateBootstrapAccess, summarizeDocuments } from "./demoPlatform.js";

initializeApp();

const REGION = "africa-south1";
const OWNER_REF = "system/demo-platform";

async function authorizeBootstrap(db, caller) {
  const ownerRef = db.doc(OWNER_REF);
  const userRef = db.doc(`users/${caller.uid}`);
  await db.runTransaction(async (transaction) => {
    const [ownerSnapshot, userSnapshot] = await Promise.all([
      transaction.get(ownerRef),
      transaction.get(userRef),
    ]);
    const owner = ownerSnapshot.data();
    const profile = userSnapshot.data();
    const access = evaluateBootstrapAccess({
      ownerUid: owner?.ownerUid,
      callerUid: caller.uid,
      isSuperAdmin: profile?.platformRole === "super_admin" || caller.token.platformRole === "super_admin",
      callerTenantId: profile?.tenantId,
    });
    if (!access.allowed && access.reason === "not-owner") {
      throw new HttpsError("permission-denied", "Only the demo platform owner or a Super Admin may load demo data.");
    }
    if (!access.allowed && access.reason === "school-bound") {
      throw new HttpsError("permission-denied", "A school-bound account cannot claim Super Admin ownership.");
    }
    if (!ownerSnapshot.exists) {
      transaction.create(ownerRef, {
        ownerUid: caller.uid,
        ownerEmail: caller.token.email || null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        version: 1,
      });
    } else {
      transaction.set(ownerRef, { updatedAt: FieldValue.serverTimestamp(), version: 1 }, { merge: true });
    }
  });
}

async function ensureSchoolAdmin(auth, school) {
  let account;
  let created = false;
  try {
    account = await auth.getUserByEmail(school.email);
    account = await auth.updateUser(account.uid, {
      password: DEMO_PASSWORD,
      displayName: school.adminName,
      disabled: false,
    });
  } catch (error) {
    if (error?.code !== "auth/user-not-found") throw error;
    account = await auth.createUser({
      email: school.email,
      password: DEMO_PASSWORD,
      displayName: school.adminName,
      disabled: false,
      emailVerified: true,
    });
    created = true;
  }
  const claims = { ...(account.customClaims || {}) };
  delete claims.platformRole;
  await auth.setCustomUserClaims(account.uid, {
    ...claims,
    role: "client_admin",
    tenantId: school.tenantId,
    demo: true,
  });
  return { uid: account.uid, created };
}

/** Firestore batch writes are limited to 500 ops — chunk safely. */
const BATCH_CHUNK = 400;

async function upsertDocuments(db, documents, actorUid) {
  const now = Timestamp.now();
  for (let offset = 0; offset < documents.length; offset += BATCH_CHUNK) {
    const slice = documents.slice(offset, offset + BATCH_CHUNK);
    const refs = slice.map((item) => db.doc(`${item.collection}/${item.id}`));
    const snapshots = await db.getAll(...refs);
    const batch = db.batch();
    slice.forEach((item, index) => {
      const previous = snapshots[index].data();
      batch.set(refs[index], {
        ...item.data,
        id: item.id,
        tenantId: item.tenantId,
        createdAt: previous?.createdAt || now,
        createdBy: previous?.createdBy || actorUid,
        updatedAt: now,
        demo: true,
      }, { merge: true });
    });
    await batch.commit();
  }
}

export const bootstrapDemoPlatform = onCall({
  region: REGION,
  timeoutSeconds: 120,
  memory: "512MiB",
  maxInstances: 2,
  cors: true,
}, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in before loading the demo platform.");

  const db = getFirestore();
  const auth = getAuth();
  const caller = request.auth;
  try {
    await authorizeBootstrap(db, caller);

    const schoolAdmins = {};
    for (const school of DEMO_SCHOOLS) {
      schoolAdmins[school.key] = await ensureSchoolAdmin(auth, school);
    }

    const callerRecord = await auth.getUser(caller.uid);
    const callerClaims = { ...(callerRecord.customClaims || {}) };
    delete callerClaims.role;
    delete callerClaims.tenantId;
    delete callerClaims.demo;
    await auth.setCustomUserClaims(caller.uid, {
      ...callerClaims,
      platformRole: "super_admin",
      demoPlatformOwner: true,
    });

    const now = Timestamp.now();
    const userRefs = [db.doc(`users/${caller.uid}`), ...DEMO_SCHOOLS.map((school) => db.doc(`users/${schoolAdmins[school.key].uid}`))];
    const userSnapshots = await db.getAll(...userRefs);
    const userBatch = db.batch();
    userBatch.set(userRefs[0], {
      id: caller.uid,
      email: caller.token.email || callerRecord.email || null,
      displayName: callerRecord.displayName || caller.token.name || "SchoolFlow Super Admin",
      organizationName: "SchoolFlow Platform",
      status: "active",
      platformRole: "super_admin",
      role: null,
      tenantId: null,
      isPlatformOnly: true,
      permissions: ["*"],
      createdAt: userSnapshots[0].data()?.createdAt || now,
      createdBy: userSnapshots[0].data()?.createdBy || caller.uid,
      updatedAt: now,
    }, { merge: true });
    DEMO_SCHOOLS.forEach((school, index) => {
      const uid = schoolAdmins[school.key].uid;
      const previous = userSnapshots[index + 1].data();
      userBatch.set(userRefs[index + 1], {
        id: uid,
        email: school.email,
        displayName: school.adminName,
        organizationName: school.name,
        status: "active",
        platformRole: null,
        role: "client_admin",
        tenantId: school.tenantId,
        permissions: ["*"],
        subscriptionStatus: "active",
        demo: true,
        createdAt: previous?.createdAt || now,
        createdBy: previous?.createdBy || caller.uid,
        updatedAt: now,
      }, { merge: true });
    });
    await userBatch.commit();

    const documents = buildDemoDocuments();
    await upsertDocuments(db, documents, caller.uid);
    await db.collection("auditLogs").add({
      tenantId: null,
      userId: caller.uid,
      action: "demo.bootstrap",
      detail: "Created or repaired the complete demonstration platform",
      meta: { version: 1, schoolTenantIds: DEMO_SCHOOLS.map((school) => school.tenantId), documentCounts: summarizeDocuments(documents) },
      createdAt: FieldValue.serverTimestamp(),
      timestamp: new Date().toISOString(),
    });

    return {
      ok: true,
      repaired: true,
      version: 1,
      schoolNames: DEMO_SCHOOLS.map((school) => school.name),
      schoolTenantIds: DEMO_SCHOOLS.map((school) => school.tenantId),
      schoolAdminUids: Object.fromEntries(DEMO_SCHOOLS.map((school) => [school.key, schoolAdmins[school.key].uid])),
      createdAuthUsers: Object.values(schoolAdmins).filter((admin) => admin.created).length,
      documentCounts: summarizeDocuments(documents),
    };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    logger.error("Demo platform bootstrap failed", { uid: caller.uid, code: error?.code, message: error?.message });
    throw new HttpsError("internal", "The demo platform could not be loaded. Please try again or contact support.");
  }
});
