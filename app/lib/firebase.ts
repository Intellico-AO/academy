import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if Firebase config is valid
const isConfigValid = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
};

// Initialize Firebase only on client side
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let initError: string | null = null;

function initializeFirebase() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!isConfigValid()) {
    initError = 'Firebase configuration is missing. Please check your .env.local file.';
    console.error(initError);
    return;
  }

  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    initError = `Firebase initialization error: ${error}`;
    console.error(initError);
  }
}

// Initialize on module load
initializeFirebase();

// Export getters to ensure lazy initialization
export function getFirebaseApp(): FirebaseApp | undefined {
  if (!app && typeof window !== 'undefined') {
    initializeFirebase();
  }
  return app;
}

export function getFirebaseAuth(): Auth | undefined {
  if (!auth && typeof window !== 'undefined') {
    initializeFirebase();
  }
  return auth;
}

export function getFirebaseDb(): Firestore | undefined {
  if (!db && typeof window !== 'undefined') {
    initializeFirebase();
  }
  return db;
}

export function getFirebaseError(): string | null {
  return initError;
}

// Also export the instances for backward compatibility
export { app, db, auth };
