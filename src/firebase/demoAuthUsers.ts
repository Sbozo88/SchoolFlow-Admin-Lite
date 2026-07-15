"use client";

import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  type AuthError,
} from "firebase/auth";
import { deleteApp, getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirebaseApp, isFirebaseConfigured } from "@/firebase/firebaseConfig";

const SECONDARY_APP_NAME = "schoolflow-demo-provisioner";

/**
 * Secondary Firebase app so we can create/sign-in demo school users
 * without replacing the Super Admin session on the primary app.
 */
function getSecondaryApp(): FirebaseApp {
  const primary = getFirebaseApp();
  const existing = getApps().find((app) => app.name === SECONDARY_APP_NAME);
  if (existing) return existing;
  return initializeApp(primary.options, SECONDARY_APP_NAME);
}

export type EnsureDemoAuthUserResult = {
  uid: string;
  email: string;
  created: boolean;
};

/**
 * Ensure a Firebase Auth user exists for a demo school admin.
 * Returns uid without changing the primary app's currentUser.
 */
export async function ensureDemoAuthUser(
  email: string,
  password: string,
): Promise<EnsureDemoAuthUserResult> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    throw new Error("Demo auth email and password are required.");
  }

  const secondary = getSecondaryApp();
  const auth = getAuth(secondary);

  try {
    const cred = await createUserWithEmailAndPassword(auth, normalized, password);
    const uid = cred.user.uid;
    await signOut(auth);
    return { uid, email: normalized, created: true };
  } catch (err) {
    const code = (err as AuthError)?.code;
    if (code === "auth/email-already-in-use") {
      try {
        const cred = await signInWithEmailAndPassword(auth, normalized, password);
        const uid = cred.user.uid;
        await signOut(auth);
        return { uid, email: normalized, created: false };
      } catch (signInErr) {
        const signCode = (signInErr as AuthError)?.code;
        throw new Error(
          `Demo user ${normalized} already exists but password does not match. ` +
            `Use password "DemoSchool123!" or delete the user in Firebase Console. (${signCode ?? "sign-in-failed"})`,
        );
      }
    }
    if (code === "auth/operation-not-allowed") {
      throw new Error(
        "Email/password sign-in is disabled in Firebase Console. Enable Authentication → Email/Password.",
      );
    }
    throw err;
  }
}

/** Optional cleanup of secondary app (not required between calls). */
export async function disposeDemoProvisionerApp(): Promise<void> {
  try {
    const app = getApp(SECONDARY_APP_NAME);
    await deleteApp(app);
  } catch {
    // not initialized
  }
}
