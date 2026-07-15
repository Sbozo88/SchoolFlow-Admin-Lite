import { doc, setDoc, getDoc } from "firebase/firestore";
import type { OrganizationSettings } from "@/types/settings";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { stampTenantCreate, stampTenantUpdate } from "@/lib/tenant/stamp";
import type { TenantWriteContext } from "@/lib/tenant/types";
import { firestoreTimestamps } from "@/firebase/tenantTimestamps";
import { useOptionalTenant } from "@/components/tenant/TenantProvider";
import { useMemo } from "react";

const SETTINGS_COLLECTION = "organizationSettings";

const demoSettings: OrganizationSettings[] = [
  {
    id: "main",
    organizationName: "TKM Music Academy",
    currency: "ZAR",
    timezone: "Africa/Johannesburg",
    programmes: ["Piano", "Guitar", "Drums", "Vocals", "Theory"],
    defaultMonthlyFee: 750,
    enrollmentFormEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function settingsDocId(tenantId: string) {
  return `${tenantId}_main`;
}

function getSettingsDoc(tenantId: string) {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return doc(getFirebaseDb(), SETTINGS_COLLECTION, settingsDocId(tenantId));
}

export async function updateSettings(
  values: Partial<Omit<OrganizationSettings, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">>,
  ctx: TenantWriteContext,
) {
  const docRef = getSettingsDoc(ctx.tenantId);
  const existing = await getDoc(docRef);
  if (!existing.exists()) {
    await setDoc(
      docRef,
      stampTenantCreate({ ...values }, ctx, firestoreTimestamps),
    );
    return;
  }
  await setDoc(docRef, stampTenantUpdate({ ...values }, firestoreTimestamps), { merge: true });
}

export function useSettings() {
  const tenant = useOptionalTenant();
  const tenantId = tenant?.activeTenantId ?? null;
  const writeContext = tenant?.writeContext ?? null;

  const { records, syncState } = useFirestoreCollection<OrganizationSettings>(
    SETTINGS_COLLECTION,
    demoSettings,
    { tenantId },
  );

  const settings = records[0] || demoSettings[0];

  return useMemo(
    () => ({
      settings,
      syncState,
      updateSettings: async (
        values: Partial<
          Omit<OrganizationSettings, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">
        >,
      ) => {
        if (!writeContext) throw new Error("No tenant write context");
        if (tenant && !tenant.canWrite) throw new Error("Write not allowed in read-only impersonation");
        return updateSettings(values, writeContext);
      },
    }),
    [settings, syncState, tenant, writeContext],
  );
}
