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
import type { Learner } from "@/types/learner";
import { demoLearners } from "@/utils/seedData";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import type { LearnerFormValues } from "@/types/learner";
import { stampTenantCreate, stampTenantUpdate } from "@/lib/tenant/stamp";
import { assertSameTenant, tenantQueryConstraint } from "@/lib/tenant/filter";
import type { TenantWriteContext } from "@/lib/tenant/types";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { useMemo } from "react";

const LEARNERS_COLLECTION = "learners";

function cleanOptional(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toLearnerPayload(values: LearnerFormValues) {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    className: values.className.trim(),
    programme: values.programme.trim(),
    instrumentOrActivity: values.instrumentOrActivity.trim(),
    parentName: values.parentName.trim(),
    parentPhone: values.parentPhone.trim(),
    parentEmail: cleanOptional(values.parentEmail),
    paymentStatus: values.paymentStatus,
    learnerStatus: values.learnerStatus,
    notes: cleanOptional(values.notes),
  };
}

function getLearnersCollection() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  return collection(getFirebaseDb(), LEARNERS_COLLECTION);
}

function getLearnerDoc(learnerId: string) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  return doc(getFirebaseDb(), LEARNERS_COLLECTION, learnerId);
}

function snapshotToLearner(snapshot: DocumentSnapshot): Learner | null {
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...snapshot.data() } as Learner;
}

export async function getLearners(tenantId: string) {
  const tq = tenantQueryConstraint(tenantId);
  const learnersQuery = query(
    getLearnersCollection(),
    where(tq.field, tq.op, tq.value),
    orderBy("lastName", "asc"),
  );
  const snapshot = await getDocs(learnersQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Learner);
}

export async function getLearnerById(learnerId: string, tenantId: string) {
  const learner = snapshotToLearner(await getDoc(getLearnerDoc(learnerId)));
  if (learner) {
    assertSameTenant((learner as { tenantId?: string }).tenantId, tenantId, "read learner");
  }
  return learner;
}

export async function createLearner(values: LearnerFormValues, ctx: TenantWriteContext) {
  const created = await addDoc(
    getLearnersCollection(),
    stampTenantCreate(toLearnerPayload(values), ctx, firestoreTimestamps),
  );
  return created.id;
}

export async function updateLearner(
  learnerId: string,
  values: LearnerFormValues,
  ctx: TenantWriteContext,
) {
  const existing = await getDoc(getLearnerDoc(learnerId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "update learner");
  await updateDoc(
    getLearnerDoc(learnerId),
    stampTenantUpdate(toLearnerPayload(values), firestoreTimestamps),
  );
}

export async function deleteLearner(learnerId: string, ctx: TenantWriteContext) {
  const existing = await getDoc(getLearnerDoc(learnerId));
  assertSameTenant(existing.data()?.tenantId, ctx.tenantId, "delete learner");
  await deleteDoc(getLearnerDoc(learnerId));
}

export function useLearners() {
  const tenant = useOptionalTenant();
  const tenantId = tenant?.activeTenantId ?? null;
  const writeContext = tenant?.writeContext ?? null;

  const collectionState = useFirestoreCollection<Learner>(LEARNERS_COLLECTION, demoLearners, {
    orderByField: "lastName",
    tenantId,
  });

  return useMemo(
    () => ({
      ...collectionState,
      createLearner: async (values: LearnerFormValues) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return createLearner(values, writeContext);
      },
      updateLearner: async (learnerId: string, values: LearnerFormValues) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return updateLearner(learnerId, values, writeContext);
      },
      deleteLearner: async (learnerId: string) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return deleteLearner(learnerId, writeContext);
      },
      getLearnerById: (learnerId: string) => {
        if (!tenantId) throw new Error("No active tenant");
        return getLearnerById(learnerId, tenantId);
      },
      getLearners: () => {
        if (!tenantId) throw new Error("No active tenant");
        return getLearners(tenantId);
      },
    }),
    [collectionState, tenant, tenantId, writeContext],
  );
}
