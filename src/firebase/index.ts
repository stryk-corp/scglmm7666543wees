'use client';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { getFirebaseApp, firebaseApp, firebaseAuth, firestore } from './init';

// Barrel file for Firebase functionality.
export {
  FirebaseProvider,
  useFirebaseApp,
  useFirestore,
  useAuth,
} from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';

export type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

// Initializes Firebase and returns the app, auth, and firestore instances.
export function initializeFirebase(): FirebaseInstances {
  const app = getFirebaseApp();
  return { app, auth: firebaseAuth, firestore };
}

export { firebaseApp, firebaseAuth, firestore };