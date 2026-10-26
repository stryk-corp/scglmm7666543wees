'use client';
import { ReactNode, useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

// This provider ensures Firebase is initialized only once on the client
// and avoids re-renders.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const instances = useMemo(() => initializeFirebase(), []);
  return <FirebaseProvider instances={instances}>{children}</FirebaseProvider>;
}
