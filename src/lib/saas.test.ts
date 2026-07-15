/**
 * Unit tests for shipped multi-tenant SaaS primitives.
 * Run: npm test
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  stampTenantCreate,
  stampTenantUpdate,
  hasRequiredTenantMeta,
} from "@/lib/tenant/stamp";
import {
  belongsToTenant,
  filterByTenant,
  assertSameTenant,
  tenantQueryConstraint,
  denyCrossTenantRead,
} from "@/lib/tenant/filter";
import {
  canPlatform,
  canTenant,
  resolveWorkspace,
  homePathForWorkspace,
  permissionsForTenantRole,
} from "@/lib/permissions/matrix";
import {
  buildTenantProvision,
  provisionProducesDistinctTenantIds,
} from "@/lib/provision/provisionTenant";
import {
  canReadTenantDoc,
  canWriteTenantDoc,
  canCreateParentSubmission,
  canManagePlatformCollection,
} from "@/lib/tenant/rulePredicates";
import {
  startImpersonationSession,
  isImpersonationActive,
  canWriteWhileImpersonating,
  resolveRestoredImpersonation,
  isImpersonationOwnedBy,
  endImpersonationOnLogout,
  writeImpersonationToStorage,
  readImpersonationFromStorage,
  clearImpersonationFromStorage,
  IMPERSONATION_STORAGE_KEY,
} from "@/lib/tenant/impersonation";
import { buildAuditLogEntry, isValidAuditEntry } from "@/lib/audit/auditLog";
import { nextStatusForLifecycle, computePlatformStats } from "@/lib/platform/clients";
import { buildInvoiceDraft, getPlanById } from "@/lib/billing/plans";
import {
  TENANT_SCOPED_COMPOSITE_INDEXES,
  requiresTenantIdFirst,
  toFirestoreIndexesFile,
} from "@/lib/tenant/indexes";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ts = {
  now: () => "2026-07-15T00:00:00.000Z",
};

describe("tenant stamp", () => {
  it("stamps tenantId, createdBy, createdAt, updatedAt on create", () => {
    const doc = stampTenantCreate({ name: "Ada" }, { tenantId: "tenant-a", userId: "user-1" }, ts);
    assert.equal(doc.tenantId, "tenant-a");
    assert.equal(doc.createdBy, "user-1");
    assert.equal(doc.createdAt, "2026-07-15T00:00:00.000Z");
    assert.equal(doc.updatedAt, "2026-07-15T00:00:00.000Z");
    assert.equal(doc.name, "Ada");
    assert.equal(hasRequiredTenantMeta(doc), true);
  });

  it("rejects create without tenantId", () => {
    assert.throws(() => stampTenantCreate({}, { tenantId: "", userId: "u" }, ts));
  });

  it("update stamps updatedAt and strips tenant reassignment fields", () => {
    const updated = stampTenantUpdate(
      { name: "B", tenantId: "evil", createdBy: "x", createdAt: "old" },
      ts,
    );
    assert.equal(updated.updatedAt, "2026-07-15T00:00:00.000Z");
    assert.equal("tenantId" in updated, false);
    assert.equal((updated as { name: string }).name, "B");
  });
});

describe("tenant filter / isolation", () => {
  const rows = [
    { id: "1", tenantId: "t1", name: "A" },
    { id: "2", tenantId: "t2", name: "B" },
    { id: "3", tenantId: "t1", name: "C" },
  ];

  it("filterByTenant only returns matching tenant", () => {
    assert.deepEqual(
      filterByTenant(rows, "t1").map((r) => r.id),
      ["1", "3"],
    );
  });

  it("wrong-tenant read returns empty via denyCrossTenantRead", () => {
    assert.deepEqual(denyCrossTenantRead(rows, "t2", "t1"), []);
  });

  it("tenant query constraint always includes tenantId equality", () => {
    const c = tenantQueryConstraint("tenant-xyz");
    assert.equal(c.field, "tenantId");
    assert.equal(c.op, "==");
    assert.equal(c.value, "tenant-xyz");
  });

  it("assertSameTenant throws on isolation violation", () => {
    assert.throws(() => assertSameTenant("t1", "t2", "read"));
    assert.doesNotThrow(() => assertSameTenant("t1", "t1", "read"));
  });

  it("belongsToTenant", () => {
    assert.equal(belongsToTenant({ tenantId: "t1" }, "t1"), true);
    assert.equal(belongsToTenant({ tenantId: "t1" }, "t2"), false);
  });
});

describe("RBAC matrix", () => {
  it("super_admin can manage clients", () => {
    assert.equal(canPlatform("super_admin", "platform.clients.write"), true);
    assert.equal(canPlatform("platform_support", "platform.clients.write"), false);
    assert.equal(canPlatform("platform_support", "platform.impersonate"), true);
  });

  it("tenant viewer cannot mutate settings permission", () => {
    assert.equal(canTenant("viewer", "tenant.settings"), false);
    assert.equal(canTenant("client_admin", "tenant.settings"), true);
    assert.equal(canTenant("finance", "tenant.payments"), true);
  });

  it("workspace routing", () => {
    assert.equal(resolveWorkspace("super_admin", null, null), "platform");
    assert.equal(resolveWorkspace(null, "client_admin", "tenant-1"), "client");
    // Bare legacy admin WITHOUT tenantId is Super Admin / platform — not school dashboard
    assert.equal(resolveWorkspace(null, "admin", null), "platform");
    assert.equal(resolveWorkspace(null, "admin", ""), "platform");
    assert.equal(resolveWorkspace(null, null, null), "platform");
    // School client only when tenant-bound
    assert.equal(resolveWorkspace(null, "admin", "tenant-1"), "client");
    assert.equal(homePathForWorkspace("platform"), "/super-admin");
    assert.equal(homePathForWorkspace("client"), "/admin");
  });

  it("tenant admin permissions are tenant-scoped catalog", () => {
    const perms = permissionsForTenantRole("admin");
    assert.ok(perms.every((p) => p.startsWith("tenant.")));
  });
});

describe("rule-shaped predicates", () => {
  const platform = { platformRole: "super_admin", role: null, tenantId: null };
  const tenantA = { platformRole: null, role: "client_admin", tenantId: "t-a" };
  const tenantB = { platformRole: null, role: "client_admin", tenantId: "t-b" };

  it("blocks cross-tenant read for tenant users", () => {
    assert.equal(canReadTenantDoc("u1", tenantA, "t-a"), true);
    assert.equal(canReadTenantDoc("u1", tenantA, "t-b"), false);
    assert.equal(canReadTenantDoc("u1", platform, "t-b"), true);
  });

  it("blocks cross-tenant write", () => {
    assert.equal(canWriteTenantDoc("u1", tenantA, "t-a", "t-a"), true);
    assert.equal(canWriteTenantDoc("u1", tenantA, "t-b", "t-b"), false);
    assert.equal(canWriteTenantDoc("u1", tenantB, "t-a", "t-a"), false);
  });

  it("parent submission create requires tenantId", () => {
    assert.equal(canCreateParentSubmission("tenant-1"), true);
    assert.equal(canCreateParentSubmission(""), false);
  });

  it("platform collections require platform role", () => {
    assert.equal(canManagePlatformCollection("u", platform), true);
    assert.equal(canManagePlatformCollection("u", tenantA), false);
  });
});

describe("provisioning", () => {
  it("produces tenant pack with meta and distinct ids", () => {
    let n = 0;
    const packA = buildTenantProvision(
      { organizationName: "School A", adminEmail: "a@example.com" },
      "actor-1",
      ts,
      { generateId: () => `tenant-test-${++n}` },
    );
    const packB = buildTenantProvision(
      { organizationName: "School B", adminEmail: "b@example.com" },
      "actor-1",
      ts,
      { generateId: () => `tenant-test-${++n}` },
    );
    assert.equal(provisionProducesDistinctTenantIds(packA, packB), true);
    assert.equal(packA.tenant.tenantId, packA.tenantId);
    assert.equal(hasRequiredTenantMeta(packA.settings as never), true);
    assert.equal(packA.adminProfile.role, "client_admin");
    assert.equal(packA.subscription.status, "trial");
    assert.ok(Array.isArray(packA.roles) && packA.roles.length >= 5);
  });
});

describe("impersonation", () => {
  it("is temporary and read-only by default mode", () => {
    const fixed = new Date("2026-07-15T12:00:00.000Z");
    const session = startImpersonationSession({
      tenantId: "t1",
      mode: "read",
      startedBy: "support-1",
      now: () => fixed,
      ttlMs: 60_000,
    });
    assert.equal(isImpersonationActive(session, () => fixed), true);
    assert.equal(canWriteWhileImpersonating(session), false);
    assert.equal(
      isImpersonationActive(session, () => new Date(fixed.getTime() + 120_000)),
      false,
    );
  });

  it("restored session requires startedBy === current user (no cross-login inheritance)", () => {
    const fixed = new Date("2026-07-15T12:00:00.000Z");
    const session = startImpersonationSession({
      tenantId: "tenant-school-a",
      mode: "read",
      startedBy: "user-alice",
      now: () => fixed,
      ttlMs: 60_000,
    });
    assert.equal(isImpersonationOwnedBy(session, "user-alice"), true);
    assert.equal(isImpersonationOwnedBy(session, "user-bob"), false);
    assert.equal(
      resolveRestoredImpersonation(session, "user-alice", () => fixed)?.tenantId,
      "tenant-school-a",
    );
    assert.equal(resolveRestoredImpersonation(session, "user-bob", () => fixed), null);
    assert.equal(resolveRestoredImpersonation(session, null, () => fixed), null);
  });

  it("logout clears storage and returns end audit only for owned active session", () => {
    const fixed = new Date("2026-07-15T12:00:00.000Z");
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
    };
    const session = startImpersonationSession({
      tenantId: "t1",
      mode: "read",
      startedBy: "user-alice",
      now: () => fixed,
      ttlMs: 60_000,
    });
    writeImpersonationToStorage(storage, session);
    assert.ok(readImpersonationFromStorage(storage));

    // Different user would not get an end audit for Alice's session ownership path
    const foreign = endImpersonationOnLogout({
      storage,
      currentUserId: "user-bob",
      now: () => fixed,
    });
    // Storage still cleared even if not owned
    assert.equal(storage.getItem(IMPERSONATION_STORAGE_KEY), null);
    assert.equal(foreign.endAudit, null);

    writeImpersonationToStorage(storage, session);
    const owned = endImpersonationOnLogout({
      storage,
      currentUserId: "user-alice",
      now: () => fixed,
    });
    assert.equal(storage.getItem(IMPERSONATION_STORAGE_KEY), null);
    assert.ok(owned.endAudit);
    assert.equal(owned.endAudit?.action, "impersonation.end");
    assert.equal(owned.endAudit?.userId, "user-alice");
    assert.equal(owned.endAudit?.tenantId, "t1");

    clearImpersonationFromStorage(storage);
    assert.equal(readImpersonationFromStorage(storage), null);
  });
});

describe("firestore composite indexes", () => {
  it("every tenant-scoped index starts with tenantId", () => {
    assert.ok(TENANT_SCOPED_COMPOSITE_INDEXES.length >= 8);
    for (const idx of TENANT_SCOPED_COMPOSITE_INDEXES) {
      assert.equal(requiresTenantIdFirst(idx), true, idx.collectionGroup);
    }
  });

  it("firestore.indexes.json matches shipped index catalog collections", () => {
    const filePath = join(process.cwd(), "firestore.indexes.json");
    const raw = JSON.parse(readFileSync(filePath, "utf8")) as {
      indexes: Array<{ collectionGroup: string; fields: Array<{ fieldPath: string }> }>;
    };
    const fromCode = toFirestoreIndexesFile();
    const fileGroups = new Set(raw.indexes.map((i) => i.collectionGroup));
    for (const idx of fromCode.indexes) {
      assert.ok(fileGroups.has(idx.collectionGroup), `missing index for ${idx.collectionGroup}`);
      const fileIdx = raw.indexes.find((i) => i.collectionGroup === idx.collectionGroup);
      assert.equal(fileIdx?.fields[0]?.fieldPath, "tenantId");
    }
    assert.ok(raw.indexes.length >= 8);
  });
});

describe("admin route live wiring (structural)", () => {
  it("primary admin pages re-export live views", () => {
    const routes = [
      "src/routes/admin/learners/page.tsx",
      "src/routes/admin/attendance/page.tsx",
      "src/routes/admin/payments/page.tsx",
      "src/routes/admin/parent-follow-ups/page.tsx",
      "src/routes/admin/parent-form/page.tsx",
      "src/routes/admin/reports/page.tsx",
      "src/routes/admin/settings/page.tsx",
    ];
    for (const route of routes) {
      const src = readFileSync(join(process.cwd(), route), "utf8");
      assert.match(src, /@\/views\/admin\//, route);
      assert.doesNotMatch(src, /useMockData/, route);
    }
  });
});

describe("impersonation gate (shipped workspaceAccess)", () => {
  it("platform user may stay on /admin only while impersonating", async () => {
    const {
      canStayOnClientWorkspace,
      shouldRedirectPlatformUserFromAdmin,
      canAccessPlatformWorkspace,
    } = await import("@/lib/permissions/workspaceAccess");
    assert.equal(
      canStayOnClientWorkspace({
        role: null,
        platformRole: "super_admin",
        tenantRole: null,
        homeTenantId: null,
        isImpersonating: false,
      }),
      false,
    );
    assert.equal(
      canStayOnClientWorkspace({
        role: null,
        platformRole: "super_admin",
        tenantRole: null,
        homeTenantId: null,
        isImpersonating: true,
      }),
      true,
    );
    // Bare legacy "admin" without tenant must NOT use school dashboard
    assert.equal(
      canStayOnClientWorkspace({
        role: "admin",
        platformRole: null,
        tenantRole: "admin",
        homeTenantId: null,
        isImpersonating: false,
      }),
      false,
    );
    assert.equal(
      shouldRedirectPlatformUserFromAdmin({
        platformRole: null,
        homeTenantId: null,
        tenantRole: "admin",
        isImpersonating: false,
      }),
      true,
    );
    assert.equal(
      shouldRedirectPlatformUserFromAdmin({
        platformRole: "super_admin",
        homeTenantId: null,
        tenantRole: null,
        isImpersonating: true,
      }),
      false,
    );
    assert.equal(
      shouldRedirectPlatformUserFromAdmin({
        platformRole: "super_admin",
        homeTenantId: null,
        tenantRole: null,
        isImpersonating: false,
      }),
      true,
    );
    // Unbound operators can open Super Admin (bootstrap)
    assert.equal(
      canAccessPlatformWorkspace({
        platformRole: null,
        homeTenantId: null,
        tenantRole: "admin",
      }),
      true,
    );
    // School-bound users cannot open Super Admin
    assert.equal(
      canAccessPlatformWorkspace({
        platformRole: null,
        homeTenantId: "tenant-1",
        tenantRole: "client_admin",
      }),
      false,
    );
  });
});

describe("audit + billing + lifecycle", () => {
  it("builds valid audit entries", () => {
    const entry = buildAuditLogEntry({
      userId: "u1",
      action: "client.create",
      tenantId: "t1",
    });
    assert.equal(isValidAuditEntry(entry), true);
  });

  it("lifecycle transitions", () => {
    assert.equal(nextStatusForLifecycle("active", "suspend"), "suspended");
    assert.equal(nextStatusForLifecycle("suspended", "reactivate"), "active");
    assert.equal(nextStatusForLifecycle("active", "archive"), "archived");
  });

  it("platform stats from tenants", () => {
    const stats = computePlatformStats({
      tenants: [
        { status: "active", subscriptionStatus: "active", storageUsedBytes: 10 },
        { status: "suspended", storageUsedBytes: 5 },
        { status: "trial", subscriptionStatus: "trial", storageUsedBytes: 1 },
      ],
    });
    assert.equal(stats.totalClients, 3);
    assert.equal(stats.activeClients, 2);
    assert.equal(stats.suspendedClients, 1);
    assert.equal(stats.storageUsage, 16);
  });

  it("invoice draft uses plan pricing", () => {
    const plan = getPlanById("plan-growth");
    assert.ok(plan);
    const inv = buildInvoiceDraft({
      tenantId: "t1",
      planId: "plan-growth",
      actorUserId: "u1",
      periodStart: "2026-07-01",
      periodEnd: "2026-08-01",
      now: () => "now",
    });
    assert.equal(inv.amount, plan!.priceMonthly);
    assert.equal(inv.tenantId, "t1");
  });
});

describe("school client dashboard presentation (UI reference)", () => {
  it("exposes reference nav, KPI labels, and quick-action hrefs from shipped constants", async () => {
    const {
      schoolPrimaryNavLabels,
      schoolSupportNavLabels,
      SCHOOL_KPI_LABELS,
      schoolQuickActionHrefs,
      SCHOOL_UPCOMING_EVENTS,
      SCHOOL_PRIMARY_NAV,
      SCHOOL_QUICK_ACTIONS,
    } = await import("@/components/admin/dashboardPresentation");

    assert.deepEqual(schoolPrimaryNavLabels(), [
      "Dashboard",
      "Learners",
      "Attendance",
      "Payments",
      "Parent Follow-Ups",
      "Reports",
      "Parent Form",
      "Settings",
    ]);
    assert.deepEqual(schoolSupportNavLabels(), ["Setup Sprint", "Handover", "Monthly Support"]);
    assert.deepEqual([...SCHOOL_KPI_LABELS], [
      "Total Learners",
      "Present Today",
      "Absent Today",
      "Payments Pending",
      "Follow-Ups",
      "New Forms",
    ]);
    assert.ok(schoolQuickActionHrefs().every((href) => href.startsWith("/admin")));
    assert.equal(SCHOOL_QUICK_ACTIONS[0].label, "Add Learner");
    assert.equal(SCHOOL_QUICK_ACTIONS[1].label, "Mark Attendance");
    assert.equal(SCHOOL_QUICK_ACTIONS[2].label, "Record Payment");
    assert.equal(SCHOOL_PRIMARY_NAV[0].href, "/admin");
    assert.equal(SCHOOL_UPCOMING_EVENTS.length, 3);
    assert.equal(SCHOOL_UPCOMING_EVENTS[0].name, "Staff Meeting");
  });
});

describe("Super Admin dashboard metrics", () => {
  it("derives revenue, storage, plan mix, and client health from tenant records", async () => {
    const { buildPlatformDashboardMetrics, formatBytes, getTenantHealth } = await import(
      "@/lib/platform/dashboard"
    );
    const base = {
      slug: "school",
      createdBy: "platform",
      createdAt: "now",
      updatedAt: "now",
      trialEndsAt: null,
      subscriptionExpiresAt: null,
      notes: "",
    };
    const tenants = [
      {
        ...base,
        id: "t1",
        tenantId: "t1",
        name: "Healthy School",
        status: "active" as const,
        planId: "plan-growth",
        subscriptionStatus: "active" as const,
        adminEmail: "admin@healthy.test",
        storageUsedBytes: 1024,
        storageQuotaBytes: 4096,
      },
      {
        ...base,
        id: "t2",
        tenantId: "t2",
        name: "Past Due School",
        status: "active" as const,
        planId: "plan-enterprise",
        subscriptionStatus: "past_due" as const,
        adminEmail: "admin@pastdue.test",
        storageUsedBytes: 2048,
        storageQuotaBytes: 4096,
      },
    ];
    const metrics = buildPlatformDashboardMetrics(tenants);
    assert.equal(metrics.monthlyRecurringRevenue, 499);
    assert.equal(metrics.storageUtilization, 38);
    assert.equal(metrics.healthyTenants, 1);
    assert.equal(metrics.attentionTenants, 1);
    assert.equal(metrics.portfolioHealth, 50);
    assert.equal(metrics.plans.find((plan) => plan.id === "plan-growth")?.clients, 1);
    assert.equal(getTenantHealth(tenants[1]), "attention");
    assert.equal(formatBytes(1024), "1.0 KB");
  });

  it("ships the enhanced platform command-center sections and responsive shell", () => {
    const dashboard = readFileSync(join(process.cwd(), "src/routes/super-admin/page.tsx"), "utf8");
    const shell = readFileSync(join(process.cwd(), "src/components/layout/SuperAdminLayout.tsx"), "utf8");
    for (const label of [
      "Total schools",
      "Monthly revenue",
      "Portfolio health",
      "Plan performance",
      "Subscription mix",
      "School health",
      "Quick operations",
      "Demo access & bootstrap",
      "Export portfolio",
    ]) {
      assert.match(dashboard, new RegExp(label.replace(/[&]/g, "\\&")), label);
    }
    assert.match(shell, /Search platform areas/);
    assert.match(shell, /Open navigation/);
    assert.match(shell, /Review audit trail/);
    assert.match(shell, /bg-\[#0b0b0d\]/);
  });
});

describe("demo platform bootstrap (Super Admin + two schools)", () => {
  it("builds platform-only Super Admin and two distinct school tenants with stamped demo data", async () => {
    const {
      buildDemoPlatformBootstrap,
      assertDemoPlatformIsolation,
      assertFirestoreWriteSafe,
      findUndefinedPaths,
      isPlatformOnlySuperAdmin,
      DEMO_SCHOOL_DEFINITIONS,
      buildSchoolDemoData,
    } = await import("@/lib/provision/bootstrapDemoPlatform");

    const bootstrap = buildDemoPlatformBootstrap({
      actorUserId: "user-super-admin-demo",
      nowIso: "2026-07-15T12:00:00.000Z",
    });

    assert.equal(bootstrap.schools.length, 2);
    assert.equal(DEMO_SCHOOL_DEFINITIONS.length, 2);
    assert.equal(bootstrap.schools[0].definition.organizationName, "Greenfield Music Academy");
    assert.equal(bootstrap.schools[1].definition.organizationName, "Riverside Arts School");

    assert.equal(isPlatformOnlySuperAdmin(bootstrap.superAdmin), true);
    assert.equal(bootstrap.superAdmin.platformRole, "super_admin");
    assert.equal(bootstrap.superAdmin.tenantId, null);
    assert.equal(bootstrap.superAdmin.role, null);

    const idA = bootstrap.schools[0].provision.tenantId;
    const idB = bootstrap.schools[1].provision.tenantId;
    assert.notEqual(idA, idB);
    assert.equal(idA, "tenant-demo-greenfield");
    assert.equal(idB, "tenant-demo-riverside");

    assertDemoPlatformIsolation(bootstrap);

    for (const school of bootstrap.schools) {
      assert.ok(school.demo.learners.length >= 3);
      for (const learner of school.demo.learners) {
        assert.equal(hasRequiredTenantMeta(learner), true);
        assert.equal(learner.tenantId, school.provision.tenantId);
        assert.equal(learner.createdBy, "user-super-admin-demo");
      }
      // Related records stamped
      assert.ok(school.demo.attendance.every((r) => r.tenantId === school.provision.tenantId));
      assert.ok(school.demo.payments.every((r) => r.tenantId === school.provision.tenantId));
    }

    // Cross-school isolation via real filter
    const aLearners = bootstrap.schools[0].demo.learners;
    assert.equal(filterByTenant(aLearners, idB).length, 0);
    assert.equal(filterByTenant(aLearners, idA).length, aLearners.length);

    // Direct builder also stamps via stampTenantCreate
    const extra = buildSchoolDemoData(idA, "Greenfield Music Academy", "user-super-admin-demo", {
      now: () => "2026-07-15T12:00:00.000Z",
    }, { schoolKey: "greenfield" });
    assert.ok(extra.learners.every((l) => l.tenantId === idA && hasRequiredTenantMeta(l)));

    // Write-path safety: every provision+demo doc destined for Firestore has no undefined leaves
    assertFirestoreWriteSafe(bootstrap);
    for (const school of bootstrap.schools) {
      for (const payment of school.demo.payments) {
        assert.equal("paymentDate" in payment && payment.paymentDate === undefined, false);
        assert.equal(findUndefinedPaths(payment).length, 0);
      }
    }
  });

  it("findUndefinedPaths detects nested undefined (write-path guard)", async () => {
    const { findUndefinedPaths, stripUndefinedDeep, assertFirestoreWriteSafe, buildDemoPlatformBootstrap } =
      await import("@/lib/provision/bootstrapDemoPlatform");
    assert.deepEqual(findUndefinedPaths({ a: 1, b: undefined }), ["b"]);
    assert.deepEqual(findUndefinedPaths({ a: { c: undefined } }), ["a.c"]);
    const cleaned = stripUndefinedDeep({ a: 1, b: undefined, c: { d: undefined, e: 2 } });
    assert.deepEqual(cleaned, { a: 1, c: { e: 2 } });
    assert.equal(findUndefinedPaths(cleaned).length, 0);

    // Guard rejects packs that still contain undefined
    const bad = buildDemoPlatformBootstrap({
      actorUserId: "user-super-admin-demo",
      nowIso: "2026-07-15T12:00:00.000Z",
    });
    (bad.schools[0].demo.payments[1] as Record<string, unknown>).paymentDate = undefined;
    assert.throws(() => assertFirestoreWriteSafe(bad), /Firestore-unsafe undefined/);
  });

  it("stripUndefinedDeep preserves FieldValue sentinels and Date by identity", async () => {
    const { stripUndefinedDeep, findUndefinedPaths, isOpaqueFirestoreValue } = await import(
      "@/lib/provision/bootstrapDemoPlatform"
    );
    const { serverTimestamp } = await import("firebase/firestore");

    const sentinel = serverTimestamp();
    const when = new Date("2026-07-15T12:00:00.000Z");
    // FieldValue-like stand-in with isEqual (mirrors Firestore contract)
    const fakeFieldValue = {
      _methodName: "serverTimestamp",
      isEqual(other: unknown) {
        return other === this;
      },
    };

    assert.equal(isOpaqueFirestoreValue(sentinel), true);
    assert.equal(isOpaqueFirestoreValue(when), true);
    assert.equal(isOpaqueFirestoreValue(fakeFieldValue), true);
    assert.equal(isOpaqueFirestoreValue({ plain: true }), false);

    const cleaned = stripUndefinedDeep({
      createdAt: sentinel,
      updatedAt: fakeFieldValue,
      occurredAt: when,
      dropMe: undefined,
      nested: { ts: sentinel, skip: undefined, keep: 1 },
    });

    // Same references — not rebuilt as plain {_methodName: ...}
    assert.equal(cleaned.createdAt, sentinel);
    assert.equal(cleaned.updatedAt, fakeFieldValue);
    assert.equal(cleaned.occurredAt, when);
    assert.equal(cleaned.nested.ts, sentinel);
    assert.equal(typeof (cleaned.createdAt as { isEqual?: unknown }).isEqual, "function");
    assert.equal((cleaned.updatedAt as { isEqual: (o: unknown) => boolean }).isEqual(fakeFieldValue), true);
    assert.equal("dropMe" in cleaned, false);
    assert.equal("skip" in cleaned.nested, false);
    assert.equal(cleaned.nested.keep, 1);
    assert.equal(findUndefinedPaths(cleaned).length, 0);

    // Corrupted plain rebuild would lose isEqual — prove we did not do that
    const corrupted = { _methodName: "serverTimestamp" };
    assert.equal(isOpaqueFirestoreValue(corrupted), false);
    assert.notEqual(cleaned.createdAt, corrupted);
  });

  it("workspace routes Super Admin to platform home", () => {
    assert.equal(resolveWorkspace("super_admin", null, null), "platform");
    assert.equal(homePathForWorkspace("platform"), "/super-admin");
  });

  it("demo login credentials: Super Admin uses current auth; schools have fixed passwords", async () => {
    const {
      getDemoLoginCredentials,
      DEMO_SCHOOL_PASSWORD,
      DEMO_SCHOOL_DEFINITIONS,
      buildDemoPlatformBootstrap,
      isPlatformOnlySuperAdmin,
    } = await import("@/lib/provision/bootstrapDemoPlatform");

    const creds = getDemoLoginCredentials({
      superAdminEmail: "operator@example.com",
      schoolTenantIds: {
        greenfield: "tenant-demo-greenfield",
        riverside: "tenant-demo-riverside",
      },
    });

    assert.equal(creds.length, 3);
    const platform = creds.find((c) => c.workspace === "platform");
    assert.ok(platform);
    assert.equal(platform!.email, "operator@example.com");
    assert.equal(platform!.password, null);
    assert.match(platform!.note, /current Firebase/i);

    const schools = creds.filter((c) => c.workspace === "client");
    assert.equal(schools.length, 2);
    for (const school of schools) {
      assert.equal(school.password, DEMO_SCHOOL_PASSWORD);
      assert.ok(school.email.includes("@"));
      assert.ok(school.tenantId);
    }
    assert.equal(
      schools.map((s) => s.email).sort().join(","),
      DEMO_SCHOOL_DEFINITIONS.map((d) => d.adminEmail).slice().sort().join(","),
    );

    // Super Admin linked to current Firebase user shape
    const bootstrap = buildDemoPlatformBootstrap({
      actorUserId: "firebase-uid-abc",
      superAdminProfileId: "firebase-uid-abc",
      superAdminEmail: "operator@example.com",
      superAdminDisplayName: "Operator",
      linkedToCurrentAuth: true,
      schoolAdminUids: {
        greenfield: "uid-greenfield",
        riverside: "uid-riverside",
      },
      nowIso: "2026-07-15T12:00:00.000Z",
    });
    assert.equal(isPlatformOnlySuperAdmin(bootstrap.superAdmin), true);
    assert.equal(bootstrap.superAdmin.id, "firebase-uid-abc");
    assert.equal(bootstrap.superAdmin.email, "operator@example.com");
    assert.equal(bootstrap.superAdmin.linkedToCurrentAuth, true);
    assert.equal(bootstrap.schools[0].provision.adminProfile.id, "uid-greenfield");
    assert.equal(bootstrap.schools[1].provision.adminProfile.id, "uid-riverside");
  });
});
