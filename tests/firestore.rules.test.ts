import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, beforeEach, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

let environment: RulesTestEnvironment;

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: "schoolflow-admin-lite-rules-test",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, "users/green-admin"), { role: "client_admin", platformRole: null, tenantId: "tenant-demo-greenfield" }),
      setDoc(doc(db, "users/river-admin"), { role: "client_admin", platformRole: null, tenantId: "tenant-demo-riverside" }),
      setDoc(doc(db, "users/super-admin"), { role: null, platformRole: "super_admin", tenantId: null }),
      setDoc(doc(db, "tenants/tenant-demo-greenfield"), { tenantId: "tenant-demo-greenfield", name: "Greenfield Music School" }),
      setDoc(doc(db, "tenants/tenant-demo-riverside"), { tenantId: "tenant-demo-riverside", name: "Riverside Arts Academy" }),
      setDoc(doc(db, "learners/greenfield-learner-1"), { tenantId: "tenant-demo-greenfield", name: "Green Learner" }),
      setDoc(doc(db, "learners/riverside-learner-1"), { tenantId: "tenant-demo-riverside", name: "River Learner" }),
    ]);
  });
});

after(async () => environment?.cleanup());

test("school admins can read only their own tenant records", async () => {
  const green = environment.authenticatedContext("green-admin").firestore();
  await assertSucceeds(getDoc(doc(green, "learners/greenfield-learner-1")));
  await assertFails(getDoc(doc(green, "learners/riverside-learner-1")));
  await assertFails(getDoc(doc(green, "tenants/tenant-demo-riverside")));
});

test("school admins cannot switch tenant or promote themselves", async () => {
  const green = environment.authenticatedContext("green-admin").firestore();
  await assertFails(updateDoc(doc(green, "users/green-admin"), { tenantId: "tenant-demo-riverside" }));
  await assertFails(updateDoc(doc(green, "users/green-admin"), { platformRole: "super_admin" }));
  await assertFails(setDoc(doc(green, "learners/forged"), {
    tenantId: "tenant-demo-riverside",
    createdBy: "green-admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "Forged",
  }));
});

test("Super Admin can manage both demo schools", async () => {
  const platform = environment.authenticatedContext("super-admin").firestore();
  const green = await assertSucceeds(getDoc(doc(platform, "learners/greenfield-learner-1")));
  const river = await assertSucceeds(getDoc(doc(platform, "learners/riverside-learner-1")));
  assert.equal(green.exists(), true);
  assert.equal(river.exists(), true);
});

test("unauthenticated users cannot read demo school data", async () => {
  const guest = environment.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(guest, "learners/greenfield-learner-1")));
});
