import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredFirebaseEnv = [
  ["NEXT_PUBLIC_FIREBASE_API_KEY", firebaseConfig.apiKey],
  ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ["NEXT_PUBLIC_FIREBASE_APP_ID", firebaseConfig.appId],
] as const;

export function getMissingFirebaseEnvVars() {
  return requiredFirebaseEnv.filter(([, value]) => !value).map(([key]) => key);
}

export function isFirebaseConfigured() {
  return getMissingFirebaseEnvVars().length === 0;
}

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(`Firebase web app credentials are not configured: ${getMissingFirebaseEnvVars().join(", ")}`);
  }

  return getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig as FirebaseOptions);
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage() {
  return getStorage(getFirebaseApp());
}
