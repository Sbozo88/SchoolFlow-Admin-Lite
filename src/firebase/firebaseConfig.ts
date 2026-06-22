import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

type ViteFirebaseEnv = {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
};

const viteEnv = (import.meta as ImportMeta & { env?: ViteFirebaseEnv }).env;

const firebaseConfig = {
  apiKey: viteEnv?.VITE_FIREBASE_API_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.VITE_FIREBASE_API_KEY,
  authDomain: viteEnv?.VITE_FIREBASE_AUTH_DOMAIN ?? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: viteEnv?.VITE_FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:
    viteEnv?.VITE_FIREBASE_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    viteEnv?.VITE_FIREBASE_MESSAGING_SENDER_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: viteEnv?.VITE_FIREBASE_APP_ID ?? process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? process.env.VITE_FIREBASE_APP_ID,
};

const requiredFirebaseEnv = [
  ["VITE_FIREBASE_API_KEY", firebaseConfig.apiKey],
  ["VITE_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["VITE_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ["VITE_FIREBASE_APP_ID", firebaseConfig.appId],
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

  return getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
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
