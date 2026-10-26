'use client';
import { createContext, useContext, ReactNode } from 'react';
import { FirebaseInstances } from './index';
import { Auth } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

const FirebaseContext = createContext<FirebaseInstances | null>(null);

export function FirebaseProvider({ children, instances }: { children: ReactNode, instances: FirebaseInstances }) {
  return (
    <FirebaseContext.Provider value={instances}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
}

// Hooks to easily access Firebase instances
export const useFirebase = (): FirebaseInstances => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = (): FirebaseApp => useFirebase().app;
export const useFirestore = (): Firestore => useFirebase().firestore;
export const useAuth = (): Auth => useFirebase().auth;
