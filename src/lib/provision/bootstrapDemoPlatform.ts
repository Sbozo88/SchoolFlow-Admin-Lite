import { buildTenantProvision, type ProvisionResult } from "@/lib/provision/provisionTenant";
import { stampTenantCreate, hasRequiredTenantMeta, type TimestampProvider } from "@/lib/tenant/stamp";
import { filterByTenant, belongsToTenant } from "@/lib/tenant/filter";
import type { TenantWriteContext } from "@/lib/tenant/types";

/** Shared demo password for school client admins (Firebase Auth email/password). */
/**
 * Shared password for *demo* school Auth users only.
 * Never use this path for real schools; bootstrap always stamps `demo: true`.
 */
export const DEMO_SCHOOL_PASSWORD = "DemoSchool123!";

/** Fixed demo school definitions — two additional isolated tenants. */
export const DEMO_SCHOOL_DEFINITIONS = [
  {
    key: "brightfutures",
    organizationName: "Bright Futures Academy",
    adminEmail: "admin@brightfutures.demo",
    adminDisplayName: "Bright Futures Admin",
    adminPassword: DEMO_SCHOOL_PASSWORD,
    planId: "plan-growth",
    notes: "Demo school A — Bright Futures Academy",
    tenantIdHint: "tenant-demo-brightfutures",
  },
  {
    key: "ubuntu",
    organizationName: "Ubuntu Excellence College",
    adminEmail: "admin@ubuntu.demo",
    adminDisplayName: "Ubuntu Admin",
    adminPassword: DEMO_SCHOOL_PASSWORD,
    planId: "plan-starter",
    notes: "Demo school B — Ubuntu Excellence College",
    tenantIdHint: "tenant-demo-ubuntu",
  },
] as const;

export type DemoSchoolKey = (typeof DEMO_SCHOOL_DEFINITIONS)[number]["key"];

export type DemoLoginCredential = {
  label: string;
  workspace: "platform" | "client";
  email: string;
  /** Password for school demos; Super Admin uses the currently signed-in Firebase account. */
  password: string | null;
  note: string;
  tenantId?: string;
};

/**
 * Demo login card content.
 * Super Admin: always the operator's current Firebase Auth user (no separate demo password).
 * Schools: fixed email/password for client workspace login.
 */
export function getDemoLoginCredentials(opts?: {
  superAdminEmail?: string | null;
  schoolTenantIds?: Partial<Record<DemoSchoolKey, string>>;
}): DemoLoginCredential[] {
  const superEmail = opts?.superAdminEmail?.trim() || "(your current Firebase login email)";
  const schools: DemoLoginCredential[] = DEMO_SCHOOL_DEFINITIONS.map((s) => ({
    label: s.organizationName,
    workspace: "client" as const,
    email: s.adminEmail,
    password: s.adminPassword,
    note: "Client workspace /school after login",
    tenantId: opts?.schoolTenantIds?.[s.key as DemoSchoolKey] ?? s.tenantIdHint,
  }));
  return [
    {
      label: "Super Admin (platform)",
      workspace: "platform",
      email: superEmail,
      password: null,
      note: "Uses your current Firebase Auth credentials — no separate demo password",
    },
    ...schools,
  ];
}

export type SuperAdminBootstrapProfile = {
  id: string;
  email: string;
  displayName: string;
  platformRole: "super_admin";
  role: null;
  tenantId: null;
  status: "active";
  organizationName: string;
  /** Platform users must not be bound to a school tenant. */
  isPlatformOnly: true;
  /** True when id/email come from the signed-in Firebase user. */
  linkedToCurrentAuth: boolean;
};

export type DemoLearnerDoc = Record<string, unknown> & { id: string; tenantId: string };
export type DemoAttendanceDoc = Record<string, unknown> & { id: string; tenantId: string };
export type DemoPaymentDoc = Record<string, unknown> & { id: string; tenantId: string };
export type DemoSubmissionDoc = Record<string, unknown> & { id: string; tenantId: string };
export type DemoActivityDoc = Record<string, unknown> & { id: string; tenantId: string };

export type SchoolDemoDataPack = {
  tenantId: string;
  schoolName: string;
  learners: DemoLearnerDoc[];
  attendance: DemoAttendanceDoc[];
  payments: DemoPaymentDoc[];
  parentSubmissions: DemoSubmissionDoc[];
  recentActivity: DemoActivityDoc[];
};

export type DemoPlatformBootstrap = {
  superAdmin: SuperAdminBootstrapProfile;
  schools: Array<{
    definition: (typeof DEMO_SCHOOL_DEFINITIONS)[number];
    provision: ProvisionResult;
    demo: SchoolDemoDataPack;
  }>;
};

const isoTimestamps = (iso: string): TimestampProvider => ({
  now: () => iso,
});

/**
 * Super Admin identity — platform-only, no school tenantId.
 * Prefer the signed-in Firebase user (uid + email); fallback demo id for pure previews.
 */
export function buildSuperAdminBootstrapProfile(opts?: {
  profileId?: string;
  email?: string;
  displayName?: string;
  linkedToCurrentAuth?: boolean;
}): SuperAdminBootstrapProfile {
  const linked = Boolean(opts?.linkedToCurrentAuth || (opts?.profileId && opts?.email));
  return {
    id: opts?.profileId ?? "user-super-admin-demo",
    email: opts?.email ?? "superadmin@schoolflow.demo",
    displayName: opts?.displayName ?? "SchoolFlow Super Admin",
    platformRole: "super_admin",
    role: null,
    tenantId: null,
    status: "active",
    organizationName: "SchoolFlow Platform",
    isPlatformOnly: true,
    linkedToCurrentAuth: linked,
  };
}

export function isPlatformOnlySuperAdmin(profile: {
  platformRole?: string | null;
  tenantId?: string | null;
  role?: string | null;
}): boolean {
  return (
    profile.platformRole === "super_admin" &&
    (profile.tenantId === null || profile.tenantId === undefined || profile.tenantId === "") &&
    (profile.role === null || profile.role === undefined || profile.role === "")
  );
}

/** Learner + related demo rows for one school, stamped via real stampTenantCreate. */
export function buildSchoolDemoData(
  tenantId: string,
  schoolName: string,
  actorUserId: string,
  timestamps: TimestampProvider,
  opts?: { schoolKey?: string },
): SchoolDemoDataPack {
  const ctx: TenantWriteContext = { tenantId, userId: actorUserId };
  const key = opts?.schoolKey ?? tenantId.slice(-8);
  const prefix = `${key}`;

  const isBrightFutures = key === "brightfutures";
  const numLearners = isBrightFutures ? 742 : 315;
  const targetPresent = isBrightFutures ? 520 : 250;
  const targetAbsent = isBrightFutures ? 38 : 12;
  const targetPendingPayments = isBrightFutures ? 18 : 5;

  const learners: DemoLearnerDoc[] = [];
  const attendance: DemoAttendanceDoc[] = [];
  const payments: DemoPaymentDoc[] = [];

  const firstNames = ["Zara", "Liam", "Amahle", "Ethan", "Chloe", "Noah", "Mia", "Leo", "Sienna", "Aiden"];
  const lastNames = ["Dlamini", "Smith", "Nkosi", "Mokoena", "Naidoo", "Williams", "Patel", "Botha", "Jacobs", "Molefe"];
  const activities = isBrightFutures 
    ? ["Mathematics", "English", "Science", "History", "Geography", "Life Skills"]
    : ["Advanced Mathematics", "Physical Sciences", "Accounting", "Business Studies", "Information Technology", "Economics"];

  for (let i = 0; i < numLearners; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const activity = activities[i % activities.length];
    
    // Payments logic
    let paymentStatus: "paid" | "partial" | "unpaid" = "paid";
    const expected = 750;
    let paid = 750;
    if (i < targetPendingPayments) {
      paymentStatus = i % 2 === 0 ? "unpaid" : "partial";
      paid = paymentStatus === "unpaid" ? 0 : 400;
    }

    const learnerSpec = {
      firstName: fn,
      lastName: `${ln} ${i}`,
      className: `Grade ${(i % 7) + 1}`,
      programme: schoolName,
      instrumentOrActivity: activity,
      parentName: `Parent ${fn} ${ln}`,
      parentPhone: `082000${String(i).padStart(4, "0")}`,
      parentEmail: `parent${i}@${key}.demo`,
      paymentStatus,
      learnerStatus: "active" as const,
      notes: `Demo learner at ${schoolName}`,
    };

    const stampedLearner = stampTenantCreate(learnerSpec, ctx, timestamps);
    const learnerId = `${prefix}-learner-${i + 1}`;
    learners.push(stripUndefinedDeep({ id: learnerId, ...stampedLearner }) as DemoLearnerDoc);

    // Attendance logic
    let attStatus: "present" | "absent" | "late" = "late";
    if (i < targetPresent) attStatus = "present";
    else if (i < targetPresent + targetAbsent) attStatus = "absent";

    const stampedAtt = stampTenantCreate({
      learnerId,
      learnerName: `${fn} ${ln} ${i}`,
      date: "2026-07-14",
      status: attStatus,
      className: learnerSpec.className,
      programme: schoolName,
    }, ctx, timestamps);
    attendance.push(stripUndefinedDeep({ id: `${prefix}-att-${i + 1}`, ...stampedAtt }) as DemoAttendanceDoc);

    // Payment docs
    const paymentFields: Record<string, unknown> = {
      learnerId,
      learnerName: `${fn} ${ln} ${i}`,
      month: "2026-07",
      expectedAmount: expected,
      paidAmount: paid,
      balance: expected - paid,
      status: paymentStatus,
    };
    if (paymentStatus === "paid") paymentFields.paymentDate = "2026-07-05";
    const stampedPay = stampTenantCreate(paymentFields, ctx, timestamps);
    payments.push(stripUndefinedDeep({ id: `${prefix}-pay-${i + 1}`, ...stampedPay }) as DemoPaymentDoc);
  }

  const parentSubmissions: DemoSubmissionDoc[] = [
    stripUndefinedDeep({
      id: `${prefix}-sub-1`,
      ...stampTenantCreate(
        {
          learnerFirstName: key === "ubuntu" ? "Noah" : "Chloe",
          learnerLastName: key === "ubuntu" ? "Williams" : "Naidoo",
          className: "Grade 2",
          programme: schoolName,
          instrumentOrActivity: key === "ubuntu" ? "Information Technology" : "Mathematics",
          parentName: key === "ubuntu" ? "Sam Williams" : "Priya Naidoo",
          parentPhone: "0800111222",
          parentEmail: "newparent@demo.school",
          status: "new",
          message: `Interested in enrolling at ${schoolName}`,
        },
        ctx,
        timestamps,
      ),
    }) as DemoSubmissionDoc,
  ];

  const recentActivity: DemoActivityDoc[] = [
    stripUndefinedDeep({
      id: `${prefix}-act-1`,
      ...stampTenantCreate(
        {
          type: "learner",
          title: "Demo data loaded",
          description: `Seeded demo workspace for ${schoolName}`,
          timestamp: timestamps.now(),
          link: "/school/learners",
        },
        ctx,
        timestamps,
      ),
    }) as DemoActivityDoc,
  ];

  return {
    tenantId,
    schoolName,
    learners,
    attendance,
    payments,
    parentSubmissions,
    recentActivity,
  };
}

/**
 * Full pure bootstrap: Super Admin (platform-only) + two school provision packs + demo data.
 * Uses real buildTenantProvision + stampTenantCreate.
 */
export function buildDemoPlatformBootstrap(opts?: {
  actorUserId?: string;
  timestamps?: TimestampProvider;
  nowIso?: string;
  /** Override id generators per school index (tests inject fixed ids). */
  generateIds?: [() => string, () => string];
  superAdminProfileId?: string;
  /** Current Firebase Auth user — Super Admin uses these credentials. */
  superAdminEmail?: string;
  superAdminDisplayName?: string;
  linkedToCurrentAuth?: boolean;
  /** Real Auth uids for school admins (from secondary Auth create). */
  schoolAdminUids?: Partial<Record<DemoSchoolKey, string>>;
}): DemoPlatformBootstrap {
  const actorUserId = opts?.actorUserId ?? "user-super-admin-demo";
  const nowIso = opts?.nowIso ?? "2026-07-15T12:00:00.000Z";
  const timestamps = opts?.timestamps ?? isoTimestamps(nowIso);

  const superAdmin = buildSuperAdminBootstrapProfile({
    profileId: opts?.superAdminProfileId ?? actorUserId,
    email: opts?.superAdminEmail,
    displayName: opts?.superAdminDisplayName,
    linkedToCurrentAuth: opts?.linkedToCurrentAuth,
  });

  if (!isPlatformOnlySuperAdmin(superAdmin)) {
    throw new Error("Super Admin bootstrap profile must be platform-only");
  }

  const schools = DEMO_SCHOOL_DEFINITIONS.map((definition, index) => {
    const generateId =
      opts?.generateIds?.[index] ??
      (() => definition.tenantIdHint);

    const schoolAdminUid = opts?.schoolAdminUids?.[definition.key];

    const provision = buildTenantProvision(
      {
        organizationName: definition.organizationName,
        adminEmail: definition.adminEmail,
        adminDisplayName: definition.adminDisplayName,
        planId: definition.planId,
        notes: definition.notes,
        trialDays: 30,
        adminUid: schoolAdminUid,
      },
      actorUserId,
      timestamps,
      { generateId },
    );

    const demo = buildSchoolDemoData(
      provision.tenantId,
      definition.organizationName,
      actorUserId,
      timestamps,
      { schoolKey: definition.key },
    );

    return { definition, provision, demo };
  });

  return { superAdmin, schools };
}

/**
 * True for values that must not be Object.entries-rebuilt (FieldValue, Date, Timestamp, class instances).
 * Plain `{}` maps are walked; Firestore sentinels keep identity / isEqual.
 */
export function isOpaqueFirestoreValue(value: unknown): boolean {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  if (value instanceof Date) return true;
  // FieldValue / Timestamp / GeoPoint expose isEqual
  if (typeof (value as { isEqual?: unknown }).isEqual === "function") return true;
  const proto = Object.getPrototypeOf(value);
  // Only walk plain objects (prototype Object or null)
  if (proto !== Object.prototype && proto !== null) return true;
  return false;
}

/**
 * Recursively find paths with `undefined` leaves — Firestore WriteBatch.set rejects these.
 * Returns empty array when the document is safe to write.
 * Does not walk into FieldValue/Date/class instances.
 */
export function findUndefinedPaths(value: unknown, path = ""): string[] {
  if (value === undefined) {
    return [path || "(root)"];
  }
  if (value === null || typeof value !== "object") {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => findUndefinedPaths(item, `${path}[${i}]`));
  }
  if (isOpaqueFirestoreValue(value)) {
    return [];
  }
  const out: string[] = [];
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const next = path ? `${path}.${key}` : key;
    out.push(...findUndefinedPaths(child, next));
  }
  return out;
}

/**
 * Drop keys whose value is undefined (shallow + nested plain objects/arrays).
 * Preserves Firestore FieldValue sentinels, Date, and other non-plain objects by reference.
 */
export function stripUndefinedDeep<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T;
  }
  if (isOpaqueFirestoreValue(value)) {
    return value;
  }
  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (child === undefined) continue;
    result[key] = stripUndefinedDeep(child);
  }
  return result as T;
}

/** Every provision + demo document must be Firestore-write-safe (no undefined leaves). */
export function assertFirestoreWriteSafe(bootstrap: DemoPlatformBootstrap): void {
  const docs: Array<{ label: string; doc: unknown }> = [
    { label: "superAdmin", doc: bootstrap.superAdmin },
  ];
  for (const school of bootstrap.schools) {
    const tid = school.provision.tenantId;
    docs.push(
      { label: `${tid}.tenant`, doc: school.provision.tenant },
      { label: `${tid}.settings`, doc: school.provision.settings },
      { label: `${tid}.subscription`, doc: school.provision.subscription },
      { label: `${tid}.invitation`, doc: school.provision.invitation },
      { label: `${tid}.adminProfile`, doc: school.provision.adminProfile },
    );
    for (const role of school.provision.roles) {
      docs.push({ label: `${tid}.role.${String(role.id)}`, doc: role });
    }
    for (const learner of school.demo.learners) {
      docs.push({ label: `${tid}.learner.${learner.id}`, doc: learner });
    }
    for (const row of school.demo.attendance) {
      docs.push({ label: `${tid}.attendance.${row.id}`, doc: row });
    }
    for (const row of school.demo.payments) {
      docs.push({ label: `${tid}.payment.${row.id}`, doc: row });
    }
    for (const row of school.demo.parentSubmissions) {
      docs.push({ label: `${tid}.submission.${row.id}`, doc: row });
    }
    for (const row of school.demo.recentActivity) {
      docs.push({ label: `${tid}.activity.${row.id}`, doc: row });
    }
  }

  const bad: string[] = [];
  for (const { label, doc } of docs) {
    for (const p of findUndefinedPaths(doc)) {
      bad.push(`${label}: ${p}`);
    }
  }
  if (bad.length > 0) {
    throw new Error(`Firestore-unsafe undefined fields:\n${bad.join("\n")}`);
  }
}

/** Invariants used by unit tests and seed guards. */
export function assertDemoPlatformIsolation(bootstrap: DemoPlatformBootstrap): void {
  const [a, b] = bootstrap.schools;
  if (!a || !b) throw new Error("Expected exactly two schools");
  if (a.provision.tenantId === b.provision.tenantId) {
    throw new Error("Schools must have distinct tenantIds");
  }
  if (!isPlatformOnlySuperAdmin(bootstrap.superAdmin)) {
    throw new Error("Super Admin must not be a school tenant admin");
  }

  for (const school of bootstrap.schools) {
    const tid = school.provision.tenantId;
    if (school.demo.tenantId !== tid) throw new Error("Demo pack tenantId mismatch");
    for (const learner of school.demo.learners) {
      if (!hasRequiredTenantMeta(learner)) throw new Error(`Learner ${learner.id} missing tenant meta`);
      if (!belongsToTenant(learner, tid)) throw new Error(`Learner ${learner.id} wrong tenant`);
    }
    for (const row of [
      ...school.demo.attendance,
      ...school.demo.payments,
      ...school.demo.parentSubmissions,
      ...school.demo.recentActivity,
    ]) {
      if (!hasRequiredTenantMeta(row)) throw new Error(`Record ${row.id} missing tenant meta`);
      if (!belongsToTenant(row, tid)) throw new Error(`Record ${row.id} wrong tenant`);
    }
  }

  // Cross-school isolation: school A data filtered by B is empty
  const aLearners = bootstrap.schools[0].demo.learners;
  const bId = bootstrap.schools[1].provision.tenantId;
  if (filterByTenant(aLearners, bId).length !== 0) {
    throw new Error("Cross-tenant filter leak");
  }

  assertFirestoreWriteSafe(bootstrap);
}
