export const DEMO_PASSWORD = "DemoSchool123!";

export const DEMO_SCHOOLS = [
  {
    key: "brightfutures",
    tenantId: "tenant-demo-brightfutures",
    name: "Bright Futures Academy",
    email: "admin@brightfutures.demo",
    adminName: "Bright Futures Admin",
    planId: "plan-growth",
    activities: ["Mathematics", "English", "Science", "History", "Geography", "Life Skills"],
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
    activities: ["Advanced Mathematics", "Physical Sciences", "Accounting", "Business Studies", "Information Technology", "Economics"],
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

  const isBrightFutures = school.key === "brightfutures";
  const numLearners = isBrightFutures ? 742 : 315;
  const targetPresent = isBrightFutures ? 520 : 250;
  const targetAbsent = isBrightFutures ? 38 : 12;
  const targetPendingPayments = isBrightFutures ? 18 : 5;

  const firstNames = ["Zara", "Liam", "Amahle", "Ethan", "Chloe", "Noah", "Mia", "Leo", "Sienna", "Aiden"];
  const lastNames = ["Dlamini", "Smith", "Nkosi", "Mokoena", "Naidoo", "Williams", "Patel", "Botha", "Jacobs", "Molefe"];

  const learners = Array.from({ length: numLearners }).map((_, index) => {
    const fn = firstNames[index % firstNames.length];
    const ln = lastNames[index % lastNames.length];
    const activity = school.activities[index % school.activities.length];
    
    let paymentStatus = "paid";
    if (index < targetPendingPayments) {
      paymentStatus = index % 2 === 0 ? "unpaid" : "partial";
    }

    return {
      id: `${school.key}-learner-${index + 1}`,
      firstName: fn,
      lastName: `${ln} ${index}`,
      parentName: `Parent ${fn} ${ln}`,
      className: `Grade ${(index % 7) + 1}`,
      programme: activity,
      instrumentOrActivity: activity,
      parentPhone: `08255${isBrightFutures ? "10" : "20"}${String(index % 100).padStart(2, "0")}`,
      parentEmail: `parent${index}@demo.school`,
      paymentStatus,
      learnerStatus: "active",
      notes: `Demo learner at ${school.name}`,
      demo: true,
    };
  });
  learners.forEach((learner) => docs.push(tenantDoc("learners", learner.id, school.tenantId, learner)));

  learners.forEach((learner, learnerIndex) => {
    // We only generate 1 day of attendance to save docs, targeting specific numbers
    let attStatus = "late";
    if (learnerIndex < targetPresent) attStatus = "present";
    else if (learnerIndex < targetPresent + targetAbsent) attStatus = "absent";
    
    docs.push(tenantDoc("attendance", `${school.key}-attendance-${learnerIndex + 1}-1`, school.tenantId, {
      id: `${school.key}-attendance-${learnerIndex + 1}-1`,
      learnerId: learner.id,
      learnerName: `${learner.firstName} ${learner.lastName}`,
      date: "2026-07-14", 
      status: attStatus, 
      className: learner.className, 
      programme: learner.programme, 
      demo: true,
    }));
  });

  learners.forEach((learner, index) => {
    const expectedAmount = isBrightFutures ? 850 : 780;
    let paidAmount = expectedAmount;
    if (index < targetPendingPayments) {
      paidAmount = index % 2 === 0 ? 0 : Math.round(expectedAmount * 0.55);
    }
    docs.push(tenantDoc("payments", `${school.key}-payment-${index + 1}`, school.tenantId, {
      id: `${school.key}-payment-${index + 1}`,
      learnerId: learner.id,
      learnerName: `${learner.firstName} ${learner.lastName}`,
      month: "2026-07", expectedAmount, paidAmount, balance: expectedAmount - paidAmount,
      status: paidAmount === expectedAmount ? "paid" : paidAmount > 0 ? "partial" : "unpaid",
      ...(paidAmount === expectedAmount ? { paymentDate: `2026-07-05` } : {}),
      notes: "July demo fee", demo: true,
    }));
  });

  const targetFollowUps = isBrightFutures ? 24 : 8;
  for (let index = 0; index < targetFollowUps; index++) {
    const learner = learners[index];
    docs.push(tenantDoc("followUps", `${school.key}-follow-up-${index + 1}`, school.tenantId, {
      id: `${school.key}-follow-up-${index + 1}`,
      learnerId: learner.id,
      learnerName: `${learner.firstName} ${learner.lastName}`,
      parentName: learner.parentName,
      parentPhone: learner.parentPhone,
      reason: index % 3 === 0 ? "unpaid_fees" : index % 3 === 1 ? "missing_info" : "absence",
      status: index % 2 === 0 ? "urgent" : "pending", // active followUps include both pending and urgent
      message: `Please follow up with ${learner.parentName} regarding ${learner.firstName}.`,
      dueDate: `2026-07-${18 + (index % 10)}`, demo: true,
    }));
  }

  const targetForms = isBrightFutures ? 7 : 3;
  for (let index = 0; index < targetForms; index++) {
    docs.push(tenantDoc("parentSubmissions", `${school.key}-submission-${index + 1}`, school.tenantId, {
      id: `${school.key}-submission-${index + 1}`,
      learnerFirstName: firstNames[index % firstNames.length],
      learnerLastName: lastNames[index % lastNames.length],
      className: `Grade ${(index % 7) + 1}`,
      programme: school.activities[index % school.activities.length],
      instrumentOrActivity: school.activities[index % school.activities.length],
      parentName: `Parent ${index}`,
      parentPhone: `083700100${index}`,
      parentEmail: `new.parent${index + 1}@demo.school`,
      status: "new",
      message: `Interested in ${school.activities[index % school.activities.length]} at ${school.name}.`, demo: true,
    }));
  }

  const activity = [
    ["learner", "Six learner profiles ready", "Review the complete demo learner register", "/school/learners"],
    ["attendance", "Attendance captured", "Five days of attendance are available", "/school/attendance"],
    ["payment", "July fees reconciled", "Paid, partial, and unpaid records are ready", "/school/payments"],
    ["form", "New enrollment received", "A parent form is waiting for review", "/school/parent-form"],
    ["followup", "Parent follow-ups queued", "Three realistic follow-up tasks are ready", "/school/parent-follow-ups"],
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

  [
    ["Archive Term 2 Data", "Archive all attendance and grades for Term 2.", "Pending", "Term 2"],
    ["Generate Report Cards", "Finalize and distribute report cards.", "Pending", "Term 2"],
    ["Update Fee Structures", "Set new fees for the upcoming term.", "Done", "Term 2"],
    ["Clear Term 1 Arrears", "Follow up on all term 1 unpaid balances.", "Done", "Term 1"],
  ].forEach(([title, description, status, term], index) => docs.push(tenantDoc("handoverTasks", `${school.key}-handover-${index + 1}`, school.tenantId, {
    id: `${school.key}-handover-${index + 1}`, title, description, status, term, demo: true,
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
