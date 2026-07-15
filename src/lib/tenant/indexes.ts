/**
 * Composite index definitions required by tenant-scoped live queries.
 * Kept as shipped source of truth; firestore.indexes.json is generated from these shapes.
 */

export type CompositeIndexField = {
  fieldPath: string;
  order: "ASCENDING" | "DESCENDING";
};

export type CompositeIndexDef = {
  collectionGroup: string;
  queryScope: "COLLECTION";
  fields: CompositeIndexField[];
};

/** Every live hook that uses where(tenantId)== + orderBy must appear here. */
export const TENANT_SCOPED_COMPOSITE_INDEXES: CompositeIndexDef[] = [
  {
    collectionGroup: "learners",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "tenantId", order: "ASCENDING" },
      { fieldPath: "lastName", order: "ASCENDING" },
    ],
  },
  {
    collectionGroup: "payments",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "tenantId", order: "ASCENDING" },
      { fieldPath: "month", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "attendance",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "tenantId", order: "ASCENDING" },
      { fieldPath: "date", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "followUps",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "tenantId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "ASCENDING" },
    ],
  },
  {
    collectionGroup: "parentSubmissions",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "tenantId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "recentActivity",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "tenantId", order: "ASCENDING" },
      { fieldPath: "timestamp", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "setupSprintTasks",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "tenantId", order: "ASCENDING" },
      { fieldPath: "day", order: "ASCENDING" },
    ],
  },
  {
    collectionGroup: "missingInfoItems",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "tenantId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "ASCENDING" },
    ],
  },
  {
    collectionGroup: "supportChecks",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "tenantId", order: "ASCENDING" },
      { fieldPath: "month", order: "ASCENDING" },
    ],
  },
  {
    collectionGroup: "organizationSettings",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "tenantId", order: "ASCENDING" },
      { fieldPath: "organizationName", order: "ASCENDING" },
    ],
  },
];

export function toFirestoreIndexesFile(indexes: CompositeIndexDef[] = TENANT_SCOPED_COMPOSITE_INDEXES) {
  return {
    indexes: indexes.map((idx) => ({
      collectionGroup: idx.collectionGroup,
      queryScope: idx.queryScope,
      fields: idx.fields,
    })),
    fieldOverrides: [] as unknown[],
  };
}

export function requiresTenantIdFirst(index: CompositeIndexDef): boolean {
  return index.fields[0]?.fieldPath === "tenantId";
}
