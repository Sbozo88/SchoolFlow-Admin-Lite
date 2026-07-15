export const DEMO_PASSWORD = "DemoSchool123!";

export const DEMO_SCHOOLS = [
  {
    key: "brightfutures",
    tenantId: "tenant-demo-brightfutures",
    name: "Bright Futures Academy",
    email: "admin@brightfutures.demo",
    adminName: "Bright Futures Admin",
    planId: "plan-growth",
    activities: ["Piano", "Guitar", "Violin", "Drums", "Choir", "Music Theory"],
    learnerNames: [
      ["Zara", "Dlamini", "Thandi Dlamini"],
      ["Liam", "Smith", "Sarah Smith"],
      ["Amahle", "Nkosi", "Bongani Nkosi"],
      ["Ethan", "Mokoena", "Naledi Mokoena"],
      ["Chloe", "Naidoo", "Priya Naidoo"],
      ["Noah", "Williams", "Sam Williams"],
    ],
  },
  {
    key: "ubuntu",
    tenantId: "tenant-demo-ubuntu",
    name: "Ubuntu Excellence College",
    email: "admin@ubuntu.demo",
    adminName: "Ubuntu Admin",
    planId: "plan-starter",
    activities: ["Drama", "Fine Art", "Dance", "Choir", "Photography", "Ceramics"],
    learnerNames: [
      ["Mia", "Patel", "Anita Patel"],
      ["Leo", "Botha", "Karin Botha"],
      ["Sienna", "Naidoo", "Priya Naidoo"],
      ["Aiden", "Jacobs", "Monique Jacobs"],
      ["Lerato", "Molefe", "Tshepo Molefe"],
      ["Daniel", "Adams", "Kelly Adams"],
    ],
  },
];

export function evaluateBootstrapAccess({ ownerUid, callerUid, isSuperAdmin, callerTenantId }) {
  if (!callerUid) return { allowed: false, reason: "unauthenticated" };
  if (ownerUid && ownerUid !== callerUid && !isSuperAdmin) {
    return { allowed: false, reason: "not-owner" };
  }
  if (!ownerUid && callerTenantId) {
    return { allowed: false, reason: "school-bound" };
  }
  return { allowed: true, reason: ownerUid ? "authorized-repair" : "first-owner" };
}

const ATTENDANCE_DATES = ["2026-07-10", "2026-07-11", "2026-07-12", "2026-07-13", "2026-07-14"];
const ROLE_DEFINITIONS = [
  ["client_admin", "School Admin", ["*"]],
  ["manager", "Manager", ["tenant.*"]],
  ["dispatcher", "Dispatcher", ["tenant.attendance", "tenant.learners"]],
  ["finance", "Finance", ["tenant.payments", "tenant.reports"]],
  ["viewer", "Viewer", ["tenant.dashboard", "tenant.reports"]],
  ["driver", "Driver", ["tenant.dashboard"]],
];

function tenantDoc(collection, id, tenantId, data) {
  return { collection, id, tenantId, data: { ...data, tenantId } };
}

export function buildSchoolDocuments(school) {
  const docs = [];
  docs.push(tenantDoc("tenants", school.tenantId, school.tenantId, {
    id: school.tenantId,
    name: school.name,
    slug: school.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    status: "active",
    planId: school.planId,
    subscriptionStatus: "active",
    subscriptionExpiresAt: "2027-07-15T00:00:00.000Z",
    trialEndsAt: null,
    adminEmail: school.email,
    storageUsedBytes: school.key === "brightfutures" ? 724775731 : 391118028,
    storageQuotaBytes: 5368709120,
    notes: "Managed demonstration tenant",
    demo: true,
  }));
  docs.push(tenantDoc("organizationSettings", `${school.tenantId}_main`, school.tenantId, {
    id: `${school.tenantId}_main`,
    organizationName: school.name,
    currency: "ZAR",
    timezone: "Africa/Johannesburg",
    programmes: school.activities,
    defaultMonthlyFee: school.key === "brightfutures" ? 850 : 780,
    enrollmentFormEnabled: true,
    demo: true,
  }));
  docs.push(tenantDoc("tenantSubscriptions", `${school.tenantId}-sub`, school.tenantId, {
    id: `${school.tenantId}-sub`, planId: school.planId, status: "active",
    renewsAt: "2026-08-15T00:00:00.000Z", paymentStatus: "paid", demo: true,
  }));
  docs.push(tenantDoc("invitations", `${school.tenantId}-invite`, school.tenantId, {
    id: `${school.tenantId}-invite`, email: school.email, role: "client_admin",
    status: "accepted", acceptedAt: "2026-07-01T10:00:00.000Z", sendEmail: false, demo: true,
  }));

  for (const [key, label, permissions] of ROLE_DEFINITIONS) {
    docs.push(tenantDoc("tenantRoles", `${school.tenantId}-role-${key}`, school.tenantId, {
      id: `${school.tenantId}-role-${key}`, roleKey: key, label, permissions, demo: true,
    }));
  }

  const learners = school.learnerNames.map(([firstName, lastName, parentName], index) => ({
    id: `${school.key}-learner-${index + 1}`,
    firstName, lastName, parentName,
    className: `Grade ${3 + (index % 4)}`,
    programme: school.activities[index],
    instrumentOrActivity: school.activities[index],
    parentPhone: `08255${school.key === "brightfutures" ? "10" : "20"}${String(index + 1).padStart(2, "0")}`,
    parentEmail: `${parentName.toLowerCase().replace(/\s+/g, ".")}@demo.school`,
    paymentStatus: index < 3 ? "paid" : index < 5 ? "partial" : "unpaid",
    learnerStatus: "active",
    notes: `Demo learner at ${school.name}`,
    demo: true,
  }));
  learners.forEach((learner) => docs.push(tenantDoc("learners", learner.id, school.tenantId, learner)));

  learners.forEach((learner, learnerIndex) => {
    ATTENDANCE_DATES.forEach((date, dateIndex) => {
      const status = (learnerIndex + dateIndex) % 9 === 0 ? "absent" : (learnerIndex + dateIndex) % 7 === 0 ? "late" : "present";
      docs.push(tenantDoc("attendance", `${school.key}-attendance-${learnerIndex + 1}-${dateIndex + 1}`, school.tenantId, {
        id: `${school.key}-attendance-${learnerIndex + 1}-${dateIndex + 1}`,
        learnerId: learner.id,
        learnerName: `${learner.firstName} ${learner.lastName}`,
        date, status, className: learner.className, programme: learner.programme, demo: true,
      }));
    });
  });

  learners.forEach((learner, index) => {
    const expectedAmount = school.key === "brightfutures" ? 850 : 780;
    const paidAmount = index < 3 ? expectedAmount : index < 5 ? Math.round(expectedAmount * 0.55) : 0;
    docs.push(tenantDoc("payments", `${school.key}-payment-${index + 1}`, school.tenantId, {
      id: `${school.key}-payment-${index + 1}`,
      learnerId: learner.id,
      learnerName: `${learner.firstName} ${learner.lastName}`,
      month: "2026-07", expectedAmount, paidAmount, balance: expectedAmount - paidAmount,
      status: paidAmount === expectedAmount ? "paid" : paidAmount > 0 ? "partial" : "unpaid",
      ...(paidAmount === expectedAmount ? { paymentDate: `2026-07-0${index + 2}` } : {}),
      notes: "July demo fee", demo: true,
    }));
  });

  [3, 4, 5].forEach((learnerIndex, index) => {
    const learner = learners[learnerIndex];
    docs.push(tenantDoc("followUps", `${school.key}-follow-up-${index + 1}`, school.tenantId, {
      id: `${school.key}-follow-up-${index + 1}`,
      learnerId: learner.id,
      learnerName: `${learner.firstName} ${learner.lastName}`,
      parentName: learner.parentName,
      parentPhone: learner.parentPhone,
      reason: index === 2 ? "unpaid_fees" : index === 1 ? "missing_info" : "absence",
      status: index === 2 ? "urgent" : "pending",
      message: `Please follow up with ${learner.parentName} regarding ${learner.firstName}.`,
      dueDate: `2026-07-${18 + index}`, demo: true,
    }));
  });

  [0, 1].forEach((index) => docs.push(tenantDoc("parentSubmissions", `${school.key}-submission-${index + 1}`, school.tenantId, {
    id: `${school.key}-submission-${index + 1}`,
    learnerFirstName: index === 0 ? "Ava" : "Luke",
    learnerLastName: index === 0 ? "Thomas" : "Wilson",
    className: `Grade ${2 + index}`,
    programme: school.activities[index],
    instrumentOrActivity: school.activities[index],
    parentName: index === 0 ? "Linda Thomas" : "Grace Wilson",
    parentPhone: `083700100${index}`,
    parentEmail: `new.parent${index + 1}@demo.school`,
    status: index === 0 ? "new" : "reviewed",
    message: `Interested in ${school.activities[index]} at ${school.name}.`, demo: true,
  })));

  const activity = [
    ["learner", "Six learner profiles ready", "Review the complete demo learner register", "/admin/learners"],
    ["attendance", "Attendance captured", "Five days of attendance are available", "/admin/attendance"],
    ["payment", "July fees reconciled", "Paid, partial, and unpaid records are ready", "/admin/payments"],
    ["form", "New enrollment received", "A parent form is waiting for review", "/admin/parent-form"],
    ["followup", "Parent follow-ups queued", "Three realistic follow-up tasks are ready", "/admin/parent-follow-ups"],
  ];
  activity.forEach(([type, title, description, link], index) => docs.push(tenantDoc("recentActivity", `${school.key}-activity-${index + 1}`, school.tenantId, {
    id: `${school.key}-activity-${index + 1}`, type, title, description, link,
    timestamp: `2026-07-15T${String(9 + index).padStart(2, "0")}:00:00.000Z`, demo: true,
  })));

  [
    [1, "Import learner register", "done"],
    [2, "Verify parent contacts", "done"],
    [3, "Capture July attendance", "in_progress"],
    [4, "Reconcile July payments", "in_progress"],
    [5, "Review reporting workflow", "not_started"],
  ].forEach(([day, title, status], index) => docs.push(tenantDoc("setupSprintTasks", `${school.key}-setup-${index + 1}`, school.tenantId, {
    id: `${school.key}-setup-${index + 1}`, day, title, description: `${school.name} onboarding task`, status, demo: true,
  })));

  [
    [learners[4], "parent_contact", "Add a secondary emergency contact", "open", "medium"],
    [learners[5], "payment_record", "Confirm July payment arrangement", "requested", "high"],
  ].forEach(([learner, category, description, status, priority], index) => docs.push(tenantDoc("missingInfoItems", `${school.key}-missing-${index + 1}`, school.tenantId, {
    id: `${school.key}-missing-${index + 1}`, learnerId: learner.id,
    learnerName: `${learner.firstName} ${learner.lastName}`, category, description, status, priority, demo: true,
  })));

  docs.push(tenantDoc("supportChecks", `${school.key}-support-2026-07`, school.tenantId, {
    id: `${school.key}-support-2026-07`, month: "2026-07",
    attendanceReviewed: true, paymentsReviewed: true, followUpsReviewed: false,
    missingInfoReviewed: false, reportsUpdated: true,
    recommendations: "Complete outstanding parent follow-ups before month end.", status: "in_progress", demo: true,
  }));
  return docs;
}

export function buildDemoDocuments() {
  return DEMO_SCHOOLS.flatMap(buildSchoolDocuments);
}

export function summarizeDocuments(documents = buildDemoDocuments()) {
  return documents.reduce((summary, item) => {
    summary[item.collection] = (summary[item.collection] || 0) + 1;
    return summary;
  }, {});
}
