'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useUser } from '@/firebase/auth/use-user';
import { getAuth } from 'firebase/auth';

// This component listens for permission errors and throws them as uncaught
// exceptions so they appear in the Next.js development error overlay.
// This is critical for the AI's debugging loop.

export function FirebaseErrorListener() {
  const { user } = useUser();

  useEffect(() => {
    const handleError = async (error: FirestorePermissionError) => {
      // The Next.js overlay doesn't render class instances well.
      // We manually construct a more readable error object.
      const displayError = {
        message: `Firestore Security Rules denied your request.`,
        details: `The ${error.context.operation} operation on path '${error.context.path}' was rejected.`,
        // The auth state is the most critical piece of debugging information.
        authState: user ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            // Fetch the ID token to show custom claims if they exist.
            token: await user.getIdTokenResult(true),
        } : 'No user authenticated.',
        // The data the client tried to write is also critical.
        requestData: error.context.requestResourceData || 'No data sent (likely a read/delete operation).',
        troubleshooting: "Please review your 'firestore.rules' file to ensure the rules allow this operation for the current user's authentication state."
      };
      
      // Throwing the error makes it appear in the Next.js overlay.
      // We are intentionally not catching this.
      throw new Error(JSON.stringify(displayError, null, 2));
    };

    errorEmitter.on('permission-error', handleError);

    // No cleanup function needed as errorEmitter is a singleton.
  }, [user]);

  return null; // This component does not render anything.
}
