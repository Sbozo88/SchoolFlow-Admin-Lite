import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type NextOrObserver,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { getUserProfile } from "@/firebase/userProfile";
import { normalizeRole } from "@/lib/rbac";
import type { Role } from "@/lib/types";

export { getFirebaseAuth };

function assertFirebaseConfigured() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
}

export async function setAuthPersistence() {
  assertFirebaseConfigured();
  await setPersistence(getFirebaseAuth(), browserLocalPersistence);
}

export function observeAuthState(nextOrObserver: NextOrObserver<User>) {
  assertFirebaseConfigured();
  return onAuthStateChanged(getFirebaseAuth(), nextOrObserver);
}

export async function signInWithEmail(email: string, password: string) {
  await setAuthPersistence();
  await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signInWithGoogle() {
  await setAuthPersistence();
  await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
}

export function signOutAdmin() {
  return isFirebaseConfigured() ? signOut(getFirebaseAuth()) : Promise.resolve();
}

export async function sendAdminPasswordReset(email: string) {
  assertFirebaseConfigured();
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

export async function getAdminRole(uid: string): Promise<Role | null> {
  assertFirebaseConfigured();
  const profile = await getUserProfile(uid);
  return normalizeRole(profile?.role);
}
