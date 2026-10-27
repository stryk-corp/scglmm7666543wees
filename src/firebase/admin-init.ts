
import { initializeApp, getApps, App, applicationDefault, cert } from 'firebase-admin/app';
import { firebaseConfig } from './config';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

function getAdminApp() {
  if (getApps().some(app => app.name === 'admin')) {
    return getApps().find(app => app.name === 'admin')!;
  }

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const credential = clientEmail && privateKey
    ? cert({
        projectId: firebaseConfig.projectId,
        clientEmail,
        privateKey,
      })
    : applicationDefault();

  adminApp = initializeApp({
    credential,
    storageBucket: firebaseConfig.storageBucket,
    projectId: firebaseConfig.projectId
  }, 'admin');
  
  return adminApp;
}

export async function initializeAdminApp() {
  const app = getAdminApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { db, auth, app };
}
