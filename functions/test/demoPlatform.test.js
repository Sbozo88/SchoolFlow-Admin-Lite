import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_SCHOOLS, buildDemoDocuments, evaluateBootstrapAccess, summarizeDocuments } from "../src/demoPlatform.js";

test("uses the required school identities and isolated tenant ids", () => {
  assert.deepEqual(DEMO_SCHOOLS.map(({ name, email, tenantId }) => ({ name, email, tenantId })), [
    { name: "Greenfield Music School", email: "admin@greenfield-music.demo", tenantId: "tenant-demo-greenfield" },
    { name: "Riverside Arts Academy", email: "admin@riverside-arts.demo", tenantId: "tenant-demo-riverside" },
  ]);
});

test("builds deterministic, unique, interconnected records", () => {
  const first = buildDemoDocuments();
  const second = buildDemoDocuments();
  assert.deepEqual(first, second);
  assert.equal(new Set(first.map((item) => `${item.collection}/${item.id}`)).size, first.length);
  for (const school of DEMO_SCHOOLS) {
    const schoolDocs = first.filter((item) => item.tenantId === school.tenantId);
    assert.ok(schoolDocs.length > 50);
    assert.ok(schoolDocs.every((item) => item.data.tenantId === school.tenantId));
    const learnerIds = new Set(schoolDocs.filter((item) => item.collection === "learners").map((item) => item.id));
    for (const item of schoolDocs.filter((row) => ["attendance", "payments", "followUps"].includes(row.collection))) {
      assert.ok(learnerIds.has(item.data.learnerId), `${item.collection}/${item.id} has a valid learner`);
    }
  }
});

test("covers live dashboards and workflows with usable data", () => {
  const counts = summarizeDocuments();
  assert.equal(counts.tenants, 2);
  assert.equal(counts.learners, 12);
  assert.equal(counts.attendance, 60);
  assert.equal(counts.payments, 12);
  assert.equal(counts.followUps, 6);
  assert.equal(counts.parentSubmissions, 4);
  assert.equal(counts.recentActivity, 10);
  assert.equal(counts.setupSprintTasks, 10);
  assert.equal(counts.missingInfoItems, 4);
  assert.equal(counts.supportChecks, 2);
});

test("only the first unbound owner or an existing super admin can bootstrap", () => {
  assert.equal(evaluateBootstrapAccess({ callerUid: "owner" }).allowed, true);
  assert.equal(evaluateBootstrapAccess({ callerUid: "school", callerTenantId: "tenant-a" }).allowed, false);
  assert.equal(evaluateBootstrapAccess({ ownerUid: "owner", callerUid: "other" }).allowed, false);
  assert.equal(evaluateBootstrapAccess({ ownerUid: "owner", callerUid: "owner" }).allowed, true);
  assert.equal(evaluateBootstrapAccess({ ownerUid: "owner", callerUid: "other", isSuperAdmin: true }).allowed, true);
});
