import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  type DocumentSnapshot,
} from "firebase/firestore";
import type { ParentSubmission, ParentSubmissionStatus } from "@/types/parentSubmission";
import { demoParentSubmissions } from "@/utils/seedData";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { stampTenantCreate, stampTenantUpdate } from "@/lib/tenant/stamp";
import { assertSameTenant, tenantQueryConstraint } from "@/lib/tenant/filter";
import type { TenantWriteContext } from "@/lib/tenant/types";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { useMemo } from "react";

const SUBMISSIONS_COLLECTION = "parentSubmissions";

function getSubmissionsCollection() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  return collection(getFirebaseDb(), SUBMISSIONS_COLLECTION);
}

function getSubmissionDoc(submissionId: string) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  return doc(getFirebaseDb(), SUBMISSIONS_COLLECTION, submissionId);
}

function snapshotToSubmission(snapshot: DocumentSnapshot): ParentSubmission | null {
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...snapshot.data() } as ParentSubmission;
}

export async function getParentSubmissions(tenantId: string) {
  const tq = tenantQueryConstraint(tenantId);
  const q = query(
    getSubmissionsCollection(),
    where(tq.field, tq.op, tq.value),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ParentSubmission);
}

export async function getSubmissionById(submissionId: string, tenantId: string) {
  const submission = snapshotToSubmission(await getDoc(getSubmissionDoc(submissionId)));
  if (submission) {
    assertSameTenant((submission as { tenantId?: string }).tenantId, tenantId, "read submission");
  }
  return submission;
}

/** Public or tenant-scoped create — always requires tenantId. */
export async function createSubmission(
  values: Omit<ParentSubmission, "id" | "createdAt" | "updatedAt" | "status" | "tenantId" | "createdBy">,
  ctx: TenantWriteContext,
) {
  const created = await addDoc(
    getSubmissionsCollection(),
    stampTenantCreate(
      {
        ...values,
        status: "new",
      },
      ctx,
      firestoreTimestamps,
    ),
  );
  return created.id;
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: ParentSubmissionStatus,
  ctx: TenantWriteContext,
) {
  const existing = await getDoc(getSubmissionDoc(submissionId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "update submission");
  await updateDoc(
    getSubmissionDoc(submissionId),
    stampTenantUpdate({ status }, firestoreTimestamps),
  );
}

export async function deleteSubmission(submissionId: string, ctx: TenantWriteContext) {
  const existing = await getDoc(getSubmissionDoc(submissionId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "delete submission");
  await deleteDoc(getSubmissionDoc(submissionId));
}

export function useParentSubmissions() {
  const tenant = useOptionalTenant();
  const tenantId = tenant?.activeTenantId ?? null;
  const writeContext = tenant?.writeContext ?? null;

  const collectionState = useFirestoreCollection<ParentSubmission>(
    SUBMISSIONS_COLLECTION,
    demoParentSubmissions,
    {
      orderByField: "createdAt",
      orderDirection: "desc",
      tenantId,
    },
  );

  return useMemo(
    () => ({
      ...collectionState,
      createSubmission: async (
        values: Omit<
          ParentSubmission,
          "id" | "createdAt" | "updatedAt" | "status" | "tenantId" | "createdBy"
        >,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        return createSubmission(values, writeContext);
      },
      updateSubmissionStatus: async (submissionId: string, status: ParentSubmissionStatus) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return updateSubmissionStatus(submissionId, status, writeContext);
      },
      deleteSubmission: async (submissionId: string) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return deleteSubmission(submissionId, writeContext);
      },
      getSubmissionById: (submissionId: string) => {
        if (!tenantId) throw new Error("No active tenant");
        return getSubmissionById(submissionId, tenantId);
      },
      getParentSubmissions: () => {
        if (!tenantId) throw new Error("No active tenant");
        return getParentSubmissions(tenantId);
      },
    }),
    [collectionState, tenant, tenantId, writeContext],
  );
}
