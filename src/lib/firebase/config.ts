// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: any = null;
let auth: Auth;
let db: Firestore;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  const isFirstInit = !getApps().length;
  app = isFirstInit ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);

  // Local development against the Firebase Emulator Suite (opt-in, never on in production builds
  // unless the flag is set). Connect only once: HMR re-evaluates this module.
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "1" && isFirstInit) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8086);
  }
} else {
  // Graceful fallback for static rendering / build time when env variables are empty
  auth = {} as Auth;
  db = {} as Firestore;
}

export { auth, db, app };
