import { getApps, initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Provides a singleton pattern for getting the firebase app.
let firebaseApp: FirebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

export const getFirebaseApp = () => firebaseApp;
export { firebaseApp };
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
