import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { OrganizationSettings } from "@/types/settings";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";

const SETTINGS_COLLECTION = "organizationSettings";
const SETTINGS_DOC_ID = "main";

const demoSettings: OrganizationSettings[] = [
  {
    id: SETTINGS_DOC_ID,
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

function getSettingsDoc() {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
  return doc(getFirebaseDb(), SETTINGS_COLLECTION, SETTINGS_DOC_ID);
}

export async function updateSettings(values: Partial<Omit<OrganizationSettings, "id" | "createdAt" | "updatedAt">>) {
  const docRef = getSettingsDoc();
  await setDoc(docRef, {
    ...values,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function useSettings() {
  const { records, syncState } = useFirestoreCollection<OrganizationSettings>(SETTINGS_COLLECTION, demoSettings);
  
  // Return the first (and only) settings document, or the demo one if not found
  const settings = records[0] || demoSettings[0];

  return {
    settings,
    syncState,
    updateSettings,
  };
}
