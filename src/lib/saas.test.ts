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
      "src/app/admin/learners/page.tsx",
      "src/app/admin/attendance/page.tsx",
      "src/app/admin/payments/page.tsx",
      "src/app/admin/parent-follow-ups/page.tsx",
      "src/app/admin/parent-form/page.tsx",
      "src/app/admin/reports/page.tsx",
      "src/app/admin/settings/page.tsx",
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
    const { canStayOnClientWorkspace, shouldRedirectPlatformUserFromAdmin } = await import(
      "@/lib/permissions/workspaceAccess"
    );
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
